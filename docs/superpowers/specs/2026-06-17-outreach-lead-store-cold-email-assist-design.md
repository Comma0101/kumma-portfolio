# Outreach Tool v1: Lead Store + Cold-Email Assist (Design Spec)

Date: 2026-06-17
Status: Approved design, pending spec review

## Where this fits

This is sub-project 0+1 of the "growth agent" decomposition (companion to
`docs/growth/smb-outreach-playbook.md`):

- **0. Lead store + consent ledger** (data foundation)
- **1. Cold-email assist** (sources prospects, AI-drafts first-touch, human approves + sends)
- 2. Post-consent concierge (handles replies, qualifies, books) - later
- 3. Compliance guardrails (cross-cutting; v1 includes the minimum)
- 4. Productization / multi-tenant - later

It is a **separate project from the portfolio.** Build target: a new repository
at `~/Workspace/kumma-outreach` (Python). The portfolio's static-export config
does not apply. This spec is stored in the portfolio docs only so the design is
captured; implementation happens in a later session run from inside the new repo.

## Goal

A local-first tool Kumma runs on his own machine that turns a list of local
businesses into personalized cold first-touch emails he reviews and sends, with
every send logged and basic CAN-SPAM compliance enforced. It fills the pipeline
and validates the outreach message while keeping a human on every send. It also
dogfoods his agent-building capability and seeds the future product.

## Scope

**In (v1):** lead store (SQLite), pluggable sourcing (CSV first, Google Places
stubbed), LLM enrichment (one personalization "hook" per lead), LLM draft
generation, a local web review queue (approve / edit / skip / send), sending via
the user's own mailbox, send logging, suppression list, CAN-SPAM footer + checks,
daily send cap.

**Out (v1, deferred):** reply handling / qualification / booking (sub-project 2),
automated multi-step sequences, multichannel (SMS/voice), Google Places live
integration (interface + stub only), open/click tracking, multi-tenant /
client-facing productization, hosting.

## Form factor

Local-first Python app, run by the user:
- SQLite database file (the lead store, local).
- A Typer CLI for sourcing, enrichment, and draft generation.
- A small FastAPI + Uvicorn local web page: the approve-and-send review queue.
- LLM (Anthropic Claude by default) behind a thin model interface so it can reuse
  ARCHON's model layer later.
- Email sent through the user's connected mailbox (SMTP app-password in v1; a
  Gmail API adapter is an optional alternative behind the same interface).
- No hosting. Data stays on the user's machine.

## Architecture and module boundaries

Each module has one responsibility and a small interface. Package root: `outreach/`.

- `config.py` - load settings from env/.env: sender identity (name, email),
  physical postal address (required for CAN-SPAM), daily cap, model API key,
  mailbox credentials. Exposes a typed `Config`.
- `models.py` - dataclasses: `RawLead`, `Lead`, `Enrichment`, `Draft`,
  `SendResult`, and the `LeadStatus` enum.
- `store.py` - the only module that touches SQLite. Methods:
  `init_db()`, `add_leads(raw: list[RawLead]) -> int` (dedup on email/domain,
  skip suppressed), `get_leads(status) -> list[Lead]`, `get_lead(id)`,
  `update_status(id, status)`, `add_enrichment(lead_id, Enrichment)`,
  `add_draft(lead_id, Draft) -> int`, `get_draft(id)`, `update_draft(id, subject, body)`,
  `record_send(lead_id, draft_id, SendResult)`, `is_suppressed(email) -> bool`,
  `add_suppression(email, reason)`.
- `sourcing/base.py` - `SourceProvider` protocol: `fetch() -> Iterable[RawLead]`.
  `sourcing/csv_provider.py` - `CsvProvider(path)` reads a CSV (columns:
  business_name, website?, email?, contact_name?, vertical?, location?).
  `sourcing/places_provider.py` - `GooglePlacesProvider` stub raising
  `NotImplementedError` with the intended interface documented (next iteration).
- `enrich.py` - `enrich(lead, llm, http) -> Enrichment`: fetch the lead's website
  homepage (httpx, short timeout, best-effort), then ask the LLM for one concrete
  personalization `hook` (e.g. an observation about their booking/calls) plus a
  few `signals`. Pure function given injected `llm` and `http` clients.
- `draft.py` - `build_draft(lead, enrichment, template, footer, llm) -> Draft`:
  produces subject + body using the lead, the hook, a base template, and appends
  the compliance `footer`. Never sends. Marks `edited=False`.
- `compliance.py` - `build_footer(config) -> str` (identity + physical address +
  plain opt-out line); `validate_sendable(draft, config) -> None` raises
  `ComplianceError` if the footer/address/opt-out line is missing; suppression
  helpers used before every send; `record_opt_out(email)`.
- `mailbox/base.py` - `MailboxAdapter` protocol: `send(to, subject, body) -> SendResult`.
  `mailbox/smtp_adapter.py` - `SmtpAdapter(config)` (v1).
  `mailbox/gmail_adapter.py` - optional `GmailAdapter` behind the same protocol.
- `llm.py` - thin `LLM` interface (`complete(system, prompt) -> str`) with an
  Anthropic implementation (Claude default). Swappable; can wrap ARCHON later.
- `web/app.py` - FastAPI app. Routes: `GET /` (review queue: leads in status
  `drafted` with their draft, an edit textarea, Approve & Send / Skip buttons),
  `POST /approve/{lead_id}` (save edits -> validate_sendable -> check suppression
  + daily cap -> send via adapter -> record_send -> status `sent`),
  `POST /skip/{lead_id}` (status `skipped`). Minimal server-rendered HTML.
- `cli.py` - Typer commands: `init`, `source --provider csv --path X`,
  `enrich [--limit N]`, `draft [--limit N]`, `review` (launches the web queue),
  `suppress --email X`, `stats`.

## Data model (SQLite)

- `leads`: id (pk), business_name, vertical, location, website, email,
  contact_name, source, status, created_at, updated_at.
- `enrichment`: lead_id (fk), hook, signals (json text), enriched_at.
- `drafts`: id (pk), lead_id (fk), subject, body, model, edited (bool), created_at.
- `sends`: id (pk), lead_id (fk), draft_id (fk), sent_at, message_id, status.
- `suppression`: email (unique), reason, added_at.

`LeadStatus`: `new`, `enriched`, `drafted`, `approved`, `sent`, `replied`,
`bounced`, `suppressed`, `skipped`. (`replied`/`bounced` are recorded manually in
v1; the concierge automates them later.)

## Data flow

1. **Source.** `source` reads a provider -> `store.add_leads` (dedup, skip
   suppressed) -> status `new`.
2. **Enrich.** `enrich` for `new` leads -> website fetch + LLM hook ->
   `add_enrichment` -> status `enriched`.
3. **Draft.** `draft` for `enriched` leads -> LLM subject/body + footer ->
   `add_draft` -> status `drafted`.
4. **Review.** `review` serves the local queue. Kumma edits, then Approve & Send
   or Skip.
5. **Send.** On approve: save edits -> `validate_sendable` -> suppression + daily
   cap check -> `MailboxAdapter.send` -> `record_send` -> status `sent`. Failures
   recorded with error status; never double-send (one successful send per lead).
6. Replies/bounces handled manually in v1 (optional `mark` command); concierge
   automates later.

## Compliance (minimum, enforced in v1)

- Every draft ends with a footer: real sender identity, physical postal address,
  and a plain opt-out line ("Reply 'no' and I will not contact you again").
- `validate_sendable` blocks any send missing the address or opt-out line.
- Suppression list checked before every send; `suppress` and opt-outs add to it.
- Configurable daily send cap (default 30) to protect deliverability.
- Ops note (not code): use a dedicated sending domain/address, not the primary
  personal/business inbox. US CAN-SPAM is the v1 target; if emailing Canada/EU,
  stricter opt-in rules apply (out of v1 scope, documented).

## Error handling

- LLM/network calls: one retry with backoff, then mark the lead's step failed and
  continue the batch (one bad lead does not stop the run).
- Website fetch is best-effort; on failure, enrichment proceeds with an empty hook
  and the draft falls back to a vertical-generic line.
- Send is idempotent: a lead already in `sent` is never re-sent; send failures are
  recorded with a status and surfaced in `stats`.

## Tech stack

Python 3.11+, SQLite (`sqlite3` stdlib or SQLModel), FastAPI + Uvicorn, Typer,
httpx, Anthropic SDK (behind `llm.py`), smtplib/Gmail API for sending.
`pyproject.toml` project. **pytest** test suite (this is a fresh repo, so real TDD
applies, unlike the static portfolio).

## Repository layout (new repo: ~/Workspace/kumma-outreach)

```
kumma-outreach/
  pyproject.toml
  README.md
  .gitignore            # data/, .env, *.db
  outreach/
    __init__.py
    config.py
    models.py
    store.py
    sourcing/{__init__.py, base.py, csv_provider.py, places_provider.py}
    enrich.py
    draft.py
    compliance.py
    mailbox/{__init__.py, base.py, smtp_adapter.py, gmail_adapter.py}
    llm.py
    web/{app.py, templates/}
    cli.py
  tests/{test_store.py, test_csv_provider.py, test_compliance.py,
         test_draft.py, test_mailbox.py}
  data/                 # gitignored: outreach.db, .env
```

## Testing approach (pytest)

- `store`: add/dedup, suppression skip on import, status transitions.
- `csv_provider`: parses required/optional columns; bad rows skipped.
- `compliance`: `validate_sendable` raises when address/opt-out missing; passes
  when footer present; suppression blocks send.
- `draft`: with a mocked LLM, produces subject+body and always appends the footer;
  empty-hook fallback path.
- `mailbox`: with a mocked transport, `send` returns a `SendResult`; daily cap and
  suppression are enforced at the send boundary; idempotent (no double-send).

## Success criteria (v1 done)

Import a CSV of local businesses, run enrich and draft, open the local review
queue, approve a few, and have them sent from the configured mailbox and logged,
with suppression and the CAN-SPAM footer enforced and the daily cap respected.
Proven end-to-end on a real small batch. Full pytest suite green.

## Open ops decisions for Kumma (not blockers to spec/plan)

- A dedicated sending domain/address (recommended) vs an existing inbox.
- SMTP app-password (v1 default) vs Gmail API OAuth.
- Anthropic API key for the LLM (drafting/enrichment cost).
- Beachhead vertical + the base email template wording (from the playbook).
