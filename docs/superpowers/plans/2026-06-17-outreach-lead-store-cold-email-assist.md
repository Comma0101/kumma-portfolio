# Outreach Tool v1 (Lead Store + Cold-Email Assist) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first Python tool that sources local-business leads, AI-enriches and drafts personalized cold emails, and lets the user review, approve, and send each from their own mailbox with CAN-SPAM compliance and a daily cap.

**Architecture:** A single Python package (`outreach/`) with focused modules: a SQLite `store`, a pluggable `sourcing` layer (CSV first), LLM-backed `enrich` and `draft`, a `compliance` guard, a `mailbox` adapter + `sender` boundary, a FastAPI `web` review queue, and a Typer `cli`. LLM and mailbox are behind small interfaces so they can be mocked in tests and swapped later.

**Tech Stack:** Python 3.11+, stdlib `sqlite3`, FastAPI + Uvicorn, Typer, httpx, Anthropic SDK, pytest.

**Execution location:** This plan is executed in a NEW repo at `~/Workspace/kumma-outreach` (separate from the portfolio). Task 0 creates it. Implements `docs/superpowers/specs/2026-06-17-outreach-lead-store-cold-email-assist-design.md`.

---

### Task 0: Repo scaffold

**Files:**
- Create: `~/Workspace/kumma-outreach/pyproject.toml`
- Create: `~/Workspace/kumma-outreach/.gitignore`
- Create: `~/Workspace/kumma-outreach/outreach/__init__.py`
- Create: `~/Workspace/kumma-outreach/tests/__init__.py`
- Create: `~/Workspace/kumma-outreach/tests/test_smoke.py`

- [ ] **Step 1: Create the repo and structure**

```bash
mkdir -p ~/Workspace/kumma-outreach/outreach/sourcing ~/Workspace/kumma-outreach/outreach/mailbox ~/Workspace/kumma-outreach/outreach/web/templates ~/Workspace/kumma-outreach/tests ~/Workspace/kumma-outreach/data
cd ~/Workspace/kumma-outreach
git init
```

- [ ] **Step 2: Write `pyproject.toml`**

```toml
[project]
name = "outreach"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.110",
  "uvicorn>=0.29",
  "typer>=0.12",
  "httpx>=0.27",
  "anthropic>=0.40",
]

[project.optional-dependencies]
dev = ["pytest>=8.0"]

[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"
```

- [ ] **Step 3: Write `.gitignore`**

```gitignore
__pycache__/
*.pyc
.venv/
data/
*.db
.env
```

- [ ] **Step 4: Create empty package markers and a smoke test**

`outreach/__init__.py`: empty file.
`tests/__init__.py`: empty file.
`tests/test_smoke.py`:

```python
def test_smoke():
    assert True
```

- [ ] **Step 5: Create venv, install, run the smoke test**

Run:
```bash
cd ~/Workspace/kumma-outreach
python3 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev]"
pytest -q
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold outreach repo"
```

---

### Task 1: Models + config

**Files:**
- Create: `outreach/models.py`
- Create: `outreach/config.py`
- Test: `tests/test_config.py`

- [ ] **Step 1: Write the failing test**

`tests/test_config.py`:

```python
from outreach.config import Config
from outreach.models import LeadStatus, RawLead, Draft


def test_config_defaults(monkeypatch):
    monkeypatch.delenv("OUTREACH_DAILY_CAP", raising=False)
    cfg = Config.from_env()
    assert cfg.daily_cap == 30
    assert "no" in cfg.opt_out_line.lower()


def test_models_exist():
    assert LeadStatus.NEW.value == "new"
    assert RawLead(business_name="Acme").business_name == "Acme"
    assert Draft(subject="s", body="b").edited is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_config.py -q`
Expected: FAIL (ModuleNotFoundError: outreach.config).

- [ ] **Step 3: Write `outreach/models.py`**

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class LeadStatus(str, Enum):
    NEW = "new"
    ENRICHED = "enriched"
    DRAFTED = "drafted"
    SENT = "sent"
    REPLIED = "replied"
    BOUNCED = "bounced"
    SUPPRESSED = "suppressed"
    SKIPPED = "skipped"
    FAILED = "failed"


@dataclass
class RawLead:
    business_name: str
    website: Optional[str] = None
    email: Optional[str] = None
    contact_name: Optional[str] = None
    vertical: Optional[str] = None
    location: Optional[str] = None


@dataclass
class Lead:
    id: int
    business_name: str
    website: Optional[str]
    email: Optional[str]
    contact_name: Optional[str]
    vertical: Optional[str]
    location: Optional[str]
    source: str
    status: LeadStatus


@dataclass
class Enrichment:
    hook: str
    signals: dict = field(default_factory=dict)


@dataclass
class Draft:
    subject: str
    body: str
    model: str = ""
    edited: bool = False
    id: Optional[int] = None


@dataclass
class SendResult:
    message_id: str
    status: str  # "sent" or "failed"
    error: Optional[str] = None
```

- [ ] **Step 4: Write `outreach/config.py`**

```python
import os
from dataclasses import dataclass


@dataclass
class Config:
    sender_name: str
    sender_email: str
    physical_address: str
    opt_out_line: str
    daily_cap: int
    anthropic_api_key: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            sender_name=os.environ.get("OUTREACH_SENDER_NAME", ""),
            sender_email=os.environ.get("OUTREACH_SENDER_EMAIL", ""),
            physical_address=os.environ.get("OUTREACH_PHYSICAL_ADDRESS", ""),
            opt_out_line=os.environ.get(
                "OUTREACH_OPT_OUT_LINE",
                "Reply 'no' and I will not contact you again.",
            ),
            daily_cap=int(os.environ.get("OUTREACH_DAILY_CAP", "30")),
            anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            smtp_host=os.environ.get("OUTREACH_SMTP_HOST", ""),
            smtp_port=int(os.environ.get("OUTREACH_SMTP_PORT", "587")),
            smtp_user=os.environ.get("OUTREACH_SMTP_USER", ""),
            smtp_password=os.environ.get("OUTREACH_SMTP_PASSWORD", ""),
        )
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pytest tests/test_config.py -q`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: models and config"
```

---

### Task 2: SQLite store

**Files:**
- Create: `outreach/store.py`
- Test: `tests/test_store.py`

- [ ] **Step 1: Write the failing test**

`tests/test_store.py`:

```python
from outreach.store import Store
from outreach.models import RawLead, LeadStatus, Enrichment, Draft, SendResult


def make_store(tmp_path):
    s = Store(str(tmp_path / "t.db"))
    s.init_db()
    return s


def test_add_and_dedup(tmp_path):
    s = make_store(tmp_path)
    added = s.add_leads([RawLead("Acme", email="a@x.com")], source="csv")
    assert added == 1
    again = s.add_leads([RawLead("Acme", email="a@x.com")], source="csv")
    assert again == 0  # dedup on email
    leads = s.get_leads(LeadStatus.NEW)
    assert len(leads) == 1 and leads[0].business_name == "Acme"


def test_suppression_blocks_import(tmp_path):
    s = make_store(tmp_path)
    s.add_suppression("a@x.com", "opt-out")
    added = s.add_leads([RawLead("Acme", email="a@x.com")], source="csv")
    assert added == 0
    assert s.is_suppressed("a@x.com") is True


def test_enrich_draft_send_flow(tmp_path):
    s = make_store(tmp_path)
    s.add_leads([RawLead("Acme", email="a@x.com")], source="csv")
    lead = s.get_leads(LeadStatus.NEW)[0]
    s.add_enrichment(lead.id, Enrichment(hook="they miss calls"))
    assert s.get_leads(LeadStatus.ENRICHED)[0].id == lead.id
    did = s.add_draft(lead.id, Draft(subject="hi", body="body"))
    assert s.get_leads(LeadStatus.DRAFTED)[0].id == lead.id
    assert s.get_draft(lead.id).subject == "hi"
    s.record_send(lead.id, did, SendResult(message_id="m1", status="sent"))
    assert s.get_lead(lead.id).status == LeadStatus.SENT
    assert s.count_sends_today() == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_store.py -q`
Expected: FAIL (ModuleNotFoundError: outreach.store).

- [ ] **Step 3: Write `outreach/store.py`**

```python
import json
import sqlite3
from datetime import date, datetime
from typing import Optional

from outreach.models import (
    Draft,
    Enrichment,
    Lead,
    LeadStatus,
    RawLead,
    SendResult,
)


class Store:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        with self._conn() as c:
            c.executescript(
                """
                CREATE TABLE IF NOT EXISTS leads (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  business_name TEXT NOT NULL,
                  website TEXT, email TEXT, contact_name TEXT,
                  vertical TEXT, location TEXT,
                  source TEXT, status TEXT NOT NULL,
                  created_at TEXT, updated_at TEXT
                );
                CREATE TABLE IF NOT EXISTS enrichment (
                  lead_id INTEGER PRIMARY KEY,
                  hook TEXT, signals TEXT, enriched_at TEXT
                );
                CREATE TABLE IF NOT EXISTS drafts (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  lead_id INTEGER, subject TEXT, body TEXT,
                  model TEXT, edited INTEGER, created_at TEXT
                );
                CREATE TABLE IF NOT EXISTS sends (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  lead_id INTEGER, draft_id INTEGER,
                  sent_at TEXT, message_id TEXT, status TEXT
                );
                CREATE TABLE IF NOT EXISTS suppression (
                  email TEXT PRIMARY KEY, reason TEXT, added_at TEXT
                );
                """
            )

    def _row_to_lead(self, r: sqlite3.Row) -> Lead:
        return Lead(
            id=r["id"], business_name=r["business_name"], website=r["website"],
            email=r["email"], contact_name=r["contact_name"],
            vertical=r["vertical"], location=r["location"],
            source=r["source"], status=LeadStatus(r["status"]),
        )

    def add_leads(self, raws: list[RawLead], source: str) -> int:
        now = datetime.utcnow().isoformat()
        added = 0
        with self._conn() as c:
            for raw in raws:
                if raw.email and self.is_suppressed(raw.email):
                    continue
                if raw.email:
                    dup = c.execute(
                        "SELECT 1 FROM leads WHERE email = ?", (raw.email,)
                    ).fetchone()
                else:
                    dup = c.execute(
                        "SELECT 1 FROM leads WHERE business_name = ? AND IFNULL(location,'') = IFNULL(?, '')",
                        (raw.business_name, raw.location),
                    ).fetchone()
                if dup:
                    continue
                c.execute(
                    "INSERT INTO leads (business_name, website, email, contact_name, vertical, location, source, status, created_at, updated_at)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (raw.business_name, raw.website, raw.email, raw.contact_name,
                     raw.vertical, raw.location, source, LeadStatus.NEW.value, now, now),
                )
                added += 1
        return added

    def get_leads(self, status: LeadStatus) -> list[Lead]:
        with self._conn() as c:
            rows = c.execute(
                "SELECT * FROM leads WHERE status = ? ORDER BY id", (status.value,)
            ).fetchall()
        return [self._row_to_lead(r) for r in rows]

    def get_lead(self, lead_id: int) -> Optional[Lead]:
        with self._conn() as c:
            r = c.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        return self._row_to_lead(r) if r else None

    def update_status(self, lead_id: int, status: LeadStatus) -> None:
        with self._conn() as c:
            c.execute(
                "UPDATE leads SET status = ?, updated_at = ? WHERE id = ?",
                (status.value, datetime.utcnow().isoformat(), lead_id),
            )

    def add_enrichment(self, lead_id: int, e: Enrichment) -> None:
        with self._conn() as c:
            c.execute(
                "INSERT OR REPLACE INTO enrichment (lead_id, hook, signals, enriched_at) VALUES (?,?,?,?)",
                (lead_id, e.hook, json.dumps(e.signals), datetime.utcnow().isoformat()),
            )
        self.update_status(lead_id, LeadStatus.ENRICHED)

    def add_draft(self, lead_id: int, d: Draft) -> int:
        with self._conn() as c:
            cur = c.execute(
                "INSERT INTO drafts (lead_id, subject, body, model, edited, created_at) VALUES (?,?,?,?,?,?)",
                (lead_id, d.subject, d.body, d.model, int(d.edited), datetime.utcnow().isoformat()),
            )
            draft_id = cur.lastrowid
        self.update_status(lead_id, LeadStatus.DRAFTED)
        return draft_id

    def get_draft(self, lead_id: int) -> Optional[Draft]:
        with self._conn() as c:
            r = c.execute(
                "SELECT * FROM drafts WHERE lead_id = ? ORDER BY id DESC LIMIT 1",
                (lead_id,),
            ).fetchone()
        if not r:
            return None
        return Draft(subject=r["subject"], body=r["body"], model=r["model"],
                     edited=bool(r["edited"]), id=r["id"])

    def update_draft(self, draft_id: int, subject: str, body: str) -> None:
        with self._conn() as c:
            c.execute(
                "UPDATE drafts SET subject = ?, body = ?, edited = 1 WHERE id = ?",
                (subject, body, draft_id),
            )

    def record_send(self, lead_id: int, draft_id: int, sr: SendResult) -> None:
        with self._conn() as c:
            c.execute(
                "INSERT INTO sends (lead_id, draft_id, sent_at, message_id, status) VALUES (?,?,?,?,?)",
                (lead_id, draft_id, datetime.utcnow().isoformat(), sr.message_id, sr.status),
            )
        self.update_status(
            lead_id, LeadStatus.SENT if sr.status == "sent" else LeadStatus.FAILED
        )

    def is_suppressed(self, email: str) -> bool:
        with self._conn() as c:
            return c.execute(
                "SELECT 1 FROM suppression WHERE email = ?", (email,)
            ).fetchone() is not None

    def add_suppression(self, email: str, reason: str) -> None:
        with self._conn() as c:
            c.execute(
                "INSERT OR IGNORE INTO suppression (email, reason, added_at) VALUES (?,?,?)",
                (email, reason, datetime.utcnow().isoformat()),
            )

    def count_sends_today(self) -> int:
        today = date.today().isoformat()
        with self._conn() as c:
            return c.execute(
                "SELECT COUNT(*) FROM sends WHERE status = 'sent' AND substr(sent_at,1,10) = ?",
                (today,),
            ).fetchone()[0]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_store.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: sqlite lead store"
```

---

### Task 3: Sourcing (CSV provider + Places stub)

**Files:**
- Create: `outreach/sourcing/__init__.py` (empty)
- Create: `outreach/sourcing/base.py`
- Create: `outreach/sourcing/csv_provider.py`
- Create: `outreach/sourcing/places_provider.py`
- Test: `tests/test_csv_provider.py`

- [ ] **Step 1: Write the failing test**

`tests/test_csv_provider.py`:

```python
from outreach.sourcing.csv_provider import CsvProvider


def test_csv_parses_rows(tmp_path):
    p = tmp_path / "leads.csv"
    p.write_text(
        "business_name,email,vertical,location\n"
        "Acme Spa,a@acme.com,med spa,LA\n"
        ",noname@x.com,,\n"  # missing business_name -> skipped
    )
    rows = list(CsvProvider(str(p)).fetch())
    assert len(rows) == 1
    assert rows[0].business_name == "Acme Spa"
    assert rows[0].vertical == "med spa"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_csv_provider.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/sourcing/base.py`**

```python
from typing import Iterable, Protocol

from outreach.models import RawLead


class SourceProvider(Protocol):
    def fetch(self) -> Iterable[RawLead]:
        ...
```

- [ ] **Step 4: Write `outreach/sourcing/csv_provider.py`**

```python
import csv
from typing import Iterable

from outreach.models import RawLead


class CsvProvider:
    """Reads leads from a CSV. Recognized columns: business_name (required),
    website, email, contact_name, vertical, location. Rows missing
    business_name are skipped."""

    def __init__(self, path: str):
        self.path = path

    def fetch(self) -> Iterable[RawLead]:
        with open(self.path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                name = (row.get("business_name") or "").strip()
                if not name:
                    continue
                yield RawLead(
                    business_name=name,
                    website=(row.get("website") or "").strip() or None,
                    email=(row.get("email") or "").strip() or None,
                    contact_name=(row.get("contact_name") or "").strip() or None,
                    vertical=(row.get("vertical") or "").strip() or None,
                    location=(row.get("location") or "").strip() or None,
                )
```

- [ ] **Step 5: Write `outreach/sourcing/places_provider.py` (documented stub)**

```python
from typing import Iterable

from outreach.models import RawLead


class GooglePlacesProvider:
    """Next iteration: pull local businesses by vertical + area via the Google
    Places API. Same interface as CsvProvider so it drops into `source`."""

    def __init__(self, api_key: str, query: str, location: str):
        self.api_key = api_key
        self.query = query
        self.location = location

    def fetch(self) -> Iterable[RawLead]:
        raise NotImplementedError("GooglePlacesProvider is planned for v2")
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pytest tests/test_csv_provider.py -q`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: csv sourcing + places stub"
```

---

### Task 4: Compliance

**Files:**
- Create: `outreach/compliance.py`
- Test: `tests/test_compliance.py`

- [ ] **Step 1: Write the failing test**

`tests/test_compliance.py`:

```python
import pytest

from outreach.compliance import build_footer, validate_sendable, ComplianceError
from outreach.config import Config
from outreach.models import Draft


def cfg(**over):
    base = dict(
        sender_name="Kumma", sender_email="k@x.com",
        physical_address="123 Main St, LA, CA", opt_out_line="Reply 'no' to opt out.",
        daily_cap=30, anthropic_api_key="", smtp_host="", smtp_port=587,
        smtp_user="", smtp_password="",
    )
    base.update(over)
    return Config(**base)


def test_footer_has_address_and_optout():
    f = build_footer(cfg())
    assert "123 Main St" in f and "opt out" in f.lower()


def test_validate_passes_when_footer_present():
    c = cfg()
    body = "Hi there.\n" + build_footer(c)
    validate_sendable(Draft(subject="s", body=body), c)  # no raise


def test_validate_raises_without_optout():
    c = cfg()
    with pytest.raises(ComplianceError):
        validate_sendable(Draft(subject="s", body="Hi, no footer here."), c)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_compliance.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/compliance.py`**

```python
from outreach.config import Config
from outreach.models import Draft


class ComplianceError(Exception):
    pass


def build_footer(config: Config) -> str:
    return (
        "\n\n--\n"
        f"{config.sender_name}\n"
        f"{config.physical_address}\n"
        f"{config.opt_out_line}\n"
    )


def validate_sendable(draft: Draft, config: Config) -> None:
    if not config.physical_address:
        raise ComplianceError("physical address not configured")
    if config.physical_address not in draft.body:
        raise ComplianceError("physical address missing from email body")
    if config.opt_out_line not in draft.body:
        raise ComplianceError("opt-out line missing from email body")
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_compliance.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: compliance footer + validation"
```

---

### Task 5: LLM interface + draft generation

**Files:**
- Create: `outreach/llm.py`
- Create: `outreach/draft.py`
- Test: `tests/test_draft.py`

- [ ] **Step 1: Write the failing test**

`tests/test_draft.py`:

```python
from outreach.draft import build_draft, DEFAULT_TEMPLATE
from outreach.compliance import build_footer
from outreach.config import Config
from outreach.models import Lead, Enrichment, LeadStatus


class FakeLLM:
    model = "fake"

    def complete(self, system: str, prompt: str) -> str:
        return "Subject: Quick question for Acme\n\nHi, I noticed you miss calls."


def cfg():
    return Config("Kumma", "k@x.com", "123 Main St", "Reply 'no' to opt out.",
                  30, "", "", 587, "", "")


def lead():
    return Lead(1, "Acme", None, "a@x.com", None, "med spa", "LA", "csv", LeadStatus.ENRICHED)


def test_build_draft_parses_and_appends_footer():
    c = cfg()
    d = build_draft(lead(), Enrichment(hook="they miss calls"),
                    DEFAULT_TEMPLATE, build_footer(c), FakeLLM())
    assert d.subject == "Quick question for Acme"
    assert "Hi, I noticed you miss calls." in d.body
    assert "123 Main St" in d.body  # footer appended
    assert d.model == "fake"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_draft.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/llm.py`**

```python
from typing import Protocol


class LLM(Protocol):
    model: str

    def complete(self, system: str, prompt: str) -> str:
        ...


class AnthropicLLM:
    def __init__(self, api_key: str, model: str = "claude-opus-4-8"):
        self.api_key = api_key
        self.model = model

    def complete(self, system: str, prompt: str) -> str:
        import anthropic

        client = anthropic.Anthropic(api_key=self.api_key)
        msg = client.messages.create(
            model=self.model,
            max_tokens=600,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(
            block.text for block in msg.content if getattr(block, "type", "") == "text"
        )
```

- [ ] **Step 4: Write `outreach/draft.py`**

```python
from outreach.llm import LLM
from outreach.models import Draft, Enrichment, Lead

DEFAULT_TEMPLATE = (
    "Write a short, warm cold email (3-4 sentences) to {business}, a {vertical}.\n"
    "Open with this specific observation: {hook}\n"
    "Offer to build an AI agent that answers calls and books appointments.\n"
    "End with a soft ask for a quick free consult.\n"
    "Return the email as:\nSubject: <subject>\n\n<body>\n"
    "Do not include a signature or footer."
)

_DRAFT_SYSTEM = (
    "You are writing concise, human, non-salesy B2B cold emails for a solo AI "
    "engineer. Plain language. No hype. No em-dashes."
)


def _parse(raw: str) -> tuple[str, str]:
    subject = ""
    body_lines: list[str] = []
    lines = raw.strip().splitlines()
    for i, line in enumerate(lines):
        if line.lower().startswith("subject:"):
            subject = line.split(":", 1)[1].strip()
            body_lines = lines[i + 1 :]
            break
    body = "\n".join(body_lines).strip()
    if not subject:  # fallback if model ignored the format
        subject = "Quick question"
        body = raw.strip()
    return subject, body


def build_draft(
    lead: Lead, enrichment: Enrichment, template: str, footer: str, llm: LLM
) -> Draft:
    hook = enrichment.hook or f"I work with {lead.vertical or 'businesses'} like yours"
    prompt = template.format(
        business=lead.business_name, vertical=lead.vertical or "business", hook=hook
    )
    raw = llm.complete(_DRAFT_SYSTEM, prompt)
    subject, body = _parse(raw)
    return Draft(subject=subject, body=body + footer, model=getattr(llm, "model", ""))
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pytest tests/test_draft.py -q`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: llm interface + draft generation"
```

---

### Task 6: Enrichment

**Files:**
- Create: `outreach/enrich.py`
- Test: `tests/test_enrich.py`

- [ ] **Step 1: Write the failing test**

`tests/test_enrich.py`:

```python
from outreach.enrich import enrich
from outreach.models import Lead, LeadStatus


class FakeLLM:
    model = "fake"

    def complete(self, system, prompt):
        return "They have no online booking, so they likely take bookings by phone."


class FakeResp:
    text = "<html>Book by calling us at 555-1234</html>"


class FakeHttp:
    def get(self, url, timeout=5):
        return FakeResp()


class FailHttp:
    def get(self, url, timeout=5):
        raise RuntimeError("network down")


def lead(website="https://acme.com"):
    return Lead(1, "Acme", website, "a@x.com", None, "med spa", "LA", "csv", LeadStatus.NEW)


def test_enrich_returns_hook_from_site():
    e = enrich(lead(), FakeLLM(), FakeHttp())
    assert "phone" in e.hook.lower()


def test_enrich_empty_when_no_website():
    e = enrich(lead(website=None), FakeLLM(), FakeHttp())
    assert e.hook == ""


def test_enrich_empty_on_fetch_failure():
    e = enrich(lead(), FakeLLM(), FailHttp())
    assert e.hook == ""
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_enrich.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/enrich.py`**

```python
from outreach.llm import LLM
from outreach.models import Enrichment, Lead

_ENRICH_SYSTEM = (
    "You analyze a local business homepage and produce ONE concrete, specific "
    "observation that could open a cold email (for example, whether they seem to "
    "take bookings by phone). One sentence. No preamble."
)


def enrich(lead: Lead, llm: LLM, http) -> Enrichment:
    if not lead.website:
        return Enrichment(hook="", signals={})
    try:
        resp = http.get(lead.website, timeout=5)
        site_text = (resp.text or "")[:2000]
    except Exception:
        return Enrichment(hook="", signals={})
    if not site_text.strip():
        return Enrichment(hook="", signals={})
    prompt = f"Business: {lead.business_name} ({lead.vertical or 'business'})\nHomepage:\n{site_text}"
    hook = llm.complete(_ENRICH_SYSTEM, prompt).strip()
    return Enrichment(hook=hook, signals={"source": "website"})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_enrich.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: website enrichment"
```

---

### Task 7: Mailbox adapter + send boundary

**Files:**
- Create: `outreach/mailbox/__init__.py` (empty)
- Create: `outreach/mailbox/base.py`
- Create: `outreach/mailbox/smtp_adapter.py`
- Create: `outreach/sender.py`
- Test: `tests/test_sender.py`

- [ ] **Step 1: Write the failing test**

`tests/test_sender.py`:

```python
import pytest

from outreach.sender import send_lead, DailyCapReached, AlreadySentError
from outreach.compliance import build_footer, ComplianceError
from outreach.config import Config
from outreach.store import Store
from outreach.models import RawLead, LeadStatus, Draft


class FakeMailbox:
    def __init__(self):
        self.sent = []

    def send(self, to, subject, body):
        from outreach.models import SendResult
        self.sent.append((to, subject))
        return SendResult(message_id="m-" + to, status="sent")


def cfg(daily_cap=30):
    return Config("Kumma", "k@x.com", "123 Main St", "Reply 'no' to opt out.",
                  daily_cap, "", "", 587, "", "")


def prep(tmp_path):
    s = Store(str(tmp_path / "t.db"))
    s.init_db()
    s.add_leads([RawLead("Acme", email="a@x.com")], source="csv")
    lead = s.get_leads(LeadStatus.NEW)[0]
    body = "Hi.\n" + build_footer(cfg())
    s.add_draft(lead.id, Draft(subject="hi", body=body))
    return s, lead


def test_send_lead_sends_and_records(tmp_path):
    s, lead = prep(tmp_path)
    mb = FakeMailbox()
    sr = send_lead(s, mb, cfg(), lead.id)
    assert sr.status == "sent"
    assert mb.sent == [("a@x.com", "hi")]
    assert s.get_lead(lead.id).status == LeadStatus.SENT


def test_daily_cap_blocks(tmp_path):
    s, lead = prep(tmp_path)
    with pytest.raises(DailyCapReached):
        send_lead(s, FakeMailbox(), cfg(daily_cap=0), lead.id)


def test_suppressed_blocks(tmp_path):
    s, lead = prep(tmp_path)
    s.add_suppression("a@x.com", "opt-out")
    with pytest.raises(ComplianceError):
        send_lead(s, FakeMailbox(), cfg(), lead.id)


def test_idempotent_no_double_send(tmp_path):
    s, lead = prep(tmp_path)
    mb = FakeMailbox()
    send_lead(s, mb, cfg(), lead.id)
    with pytest.raises(AlreadySentError):
        send_lead(s, mb, cfg(), lead.id)
    assert len(mb.sent) == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_sender.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/mailbox/base.py`**

```python
from typing import Protocol

from outreach.models import SendResult


class MailboxAdapter(Protocol):
    def send(self, to: str, subject: str, body: str) -> SendResult:
        ...
```

- [ ] **Step 4: Write `outreach/mailbox/smtp_adapter.py`**

```python
import smtplib
import uuid
from email.message import EmailMessage

from outreach.config import Config
from outreach.models import SendResult


class SmtpAdapter:
    def __init__(self, config: Config):
        self.config = config

    def send(self, to: str, subject: str, body: str) -> SendResult:
        msg = EmailMessage()
        msg["From"] = self.config.sender_email
        msg["To"] = to
        msg["Subject"] = subject
        msg["Message-ID"] = f"<{uuid.uuid4()}@outreach>"
        msg.set_content(body)
        try:
            with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port) as server:
                server.starttls()
                server.login(self.config.smtp_user, self.config.smtp_password)
                server.send_message(msg)
            return SendResult(message_id=msg["Message-ID"], status="sent")
        except Exception as exc:  # surfaced to caller, recorded as failed
            return SendResult(message_id="", status="failed", error=str(exc))
```

- [ ] **Step 5: Write `outreach/sender.py`**

```python
from outreach.compliance import ComplianceError, validate_sendable
from outreach.config import Config
from outreach.mailbox.base import MailboxAdapter
from outreach.models import LeadStatus, SendResult
from outreach.store import Store


class DailyCapReached(Exception):
    pass


class AlreadySentError(Exception):
    pass


def send_lead(
    store: Store, mailbox: MailboxAdapter, config: Config, lead_id: int
) -> SendResult:
    lead = store.get_lead(lead_id)
    if lead is None:
        raise ValueError(f"no lead {lead_id}")
    if lead.status == LeadStatus.SENT:
        raise AlreadySentError(f"lead {lead_id} already sent")
    if not lead.email:
        raise ComplianceError("lead has no email")
    if store.is_suppressed(lead.email):
        raise ComplianceError("lead is suppressed")
    draft = store.get_draft(lead_id)
    if draft is None or draft.id is None:
        raise ValueError("no draft to send")
    validate_sendable(draft, config)
    if store.count_sends_today() >= config.daily_cap:
        raise DailyCapReached(f"daily cap {config.daily_cap} reached")
    sr = mailbox.send(lead.email, draft.subject, draft.body)
    store.record_send(lead_id, draft.id, sr)
    return sr
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pytest tests/test_sender.py -q`
Expected: 4 passed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: mailbox adapter + send boundary (cap, suppression, idempotent)"
```

---

### Task 8: Web review queue

**Files:**
- Create: `outreach/web/__init__.py` (empty)
- Create: `outreach/web/app.py`
- Test: `tests/test_web.py`

- [ ] **Step 1: Write the failing test**

`tests/test_web.py`:

```python
from fastapi.testclient import TestClient

from outreach.web.app import create_app
from outreach.compliance import build_footer
from outreach.config import Config
from outreach.store import Store
from outreach.models import RawLead, LeadStatus, Draft


class FakeMailbox:
    def send(self, to, subject, body):
        from outreach.models import SendResult
        return SendResult(message_id="m1", status="sent")


def cfg():
    return Config("Kumma", "k@x.com", "123 Main St", "Reply 'no' to opt out.",
                  30, "", "", 587, "", "")


def setup_app(tmp_path):
    s = Store(str(tmp_path / "t.db"))
    s.init_db()
    s.add_leads([RawLead("Acme", email="a@x.com", vertical="med spa")], source="csv")
    lead = s.get_leads(LeadStatus.NEW)[0]
    s.add_draft(lead.id, Draft(subject="hi", body="Hi.\n" + build_footer(cfg())))
    app = create_app(s, FakeMailbox(), cfg())
    return s, lead, TestClient(app)


def test_queue_lists_drafted_leads(tmp_path):
    s, lead, client = setup_app(tmp_path)
    r = client.get("/")
    assert r.status_code == 200
    assert "Acme" in r.text


def test_approve_sends_and_updates_status(tmp_path):
    s, lead, client = setup_app(tmp_path)
    r = client.post(f"/approve/{lead.id}",
                    data={"subject": "hi", "body": "Hi.\n" + build_footer(cfg())},
                    follow_redirects=False)
    assert r.status_code in (302, 303)
    assert s.get_lead(lead.id).status == LeadStatus.SENT


def test_skip_sets_skipped(tmp_path):
    s, lead, client = setup_app(tmp_path)
    client.post(f"/skip/{lead.id}", follow_redirects=False)
    assert s.get_lead(lead.id).status == LeadStatus.SKIPPED
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_web.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/web/app.py`**

```python
import html

from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, RedirectResponse

from outreach.compliance import ComplianceError
from outreach.config import Config
from outreach.mailbox.base import MailboxAdapter
from outreach.models import LeadStatus
from outreach.sender import AlreadySentError, DailyCapReached, send_lead
from outreach.store import Store


def create_app(store: Store, mailbox: MailboxAdapter, config: Config) -> FastAPI:
    app = FastAPI()

    @app.get("/", response_class=HTMLResponse)
    def queue() -> str:
        leads = store.get_leads(LeadStatus.DRAFTED)
        sent_today = store.count_sends_today()
        parts = [
            "<html><body style='font-family:sans-serif;max-width:760px;margin:2rem auto'>",
            f"<h1>Review queue</h1><p>Sent today: {sent_today} / {config.daily_cap}</p>",
        ]
        if not leads:
            parts.append("<p>Nothing to review. Run enrich and draft first.</p>")
        for lead in leads:
            draft = store.get_draft(lead.id)
            if not draft:
                continue
            parts.append(
                f"<form method='post' action='/approve/{lead.id}' "
                "style='border:1px solid #ccc;padding:1rem;margin:1rem 0'>"
                f"<h3>{html.escape(lead.business_name)} "
                f"({html.escape(lead.email or '')})</h3>"
                f"<input name='subject' style='width:100%' "
                f"value='{html.escape(draft.subject)}'/>"
                f"<textarea name='body' rows='10' style='width:100%'>"
                f"{html.escape(draft.body)}</textarea>"
                "<button type='submit'>Approve &amp; Send</button> "
                f"<button formaction='/skip/{lead.id}' formmethod='post'>Skip</button>"
                "</form>"
            )
        parts.append("</body></html>")
        return "".join(parts)

    @app.post("/approve/{lead_id}")
    def approve(lead_id: int, subject: str = Form(...), body: str = Form(...)):
        draft = store.get_draft(lead_id)
        if draft and draft.id is not None:
            store.update_draft(draft.id, subject, body)
        try:
            send_lead(store, mailbox, config, lead_id)
        except (ComplianceError, DailyCapReached, AlreadySentError, ValueError):
            store.update_status(lead_id, LeadStatus.FAILED)
        return RedirectResponse("/", status_code=303)

    @app.post("/skip/{lead_id}")
    def skip(lead_id: int):
        store.update_status(lead_id, LeadStatus.SKIPPED)
        return RedirectResponse("/", status_code=303)

    return app
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_web.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: web review queue (approve/skip/send)"
```

---

### Task 9: CLI + README + full suite

**Files:**
- Create: `outreach/cli.py`
- Create: `README.md`
- Test: `tests/test_cli.py`

- [ ] **Step 1: Write the failing test**

`tests/test_cli.py`:

```python
from typer.testing import CliRunner

from outreach.cli import app

runner = CliRunner()


def test_init_and_stats(tmp_path, monkeypatch):
    db = str(tmp_path / "t.db")
    monkeypatch.setenv("OUTREACH_DB", db)
    assert runner.invoke(app, ["init"]).exit_code == 0
    result = runner.invoke(app, ["stats"])
    assert result.exit_code == 0
    assert "leads" in result.stdout.lower()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_cli.py -q`
Expected: FAIL (ModuleNotFoundError).

- [ ] **Step 3: Write `outreach/cli.py`**

```python
import os

import typer

from outreach.config import Config
from outreach.draft import DEFAULT_TEMPLATE, build_draft
from outreach.compliance import build_footer
from outreach.enrich import enrich as enrich_lead
from outreach.llm import AnthropicLLM
from outreach.models import LeadStatus
from outreach.sourcing.csv_provider import CsvProvider
from outreach.store import Store

app = typer.Typer(help="Outreach: lead store + cold-email assist")


def _store() -> Store:
    return Store(os.environ.get("OUTREACH_DB", "data/outreach.db"))


@app.command()
def init():
    """Create the database."""
    _store().init_db()
    typer.echo("initialized")


@app.command()
def source(path: str, provider: str = "csv"):
    """Import leads from a provider (csv)."""
    if provider != "csv":
        raise typer.BadParameter("only csv is supported in v1")
    s = _store()
    added = s.add_leads(list(CsvProvider(path).fetch()), source="csv")
    typer.echo(f"added {added} leads")


@app.command()
def enrich(limit: int = 50):
    """Enrich NEW leads with a personalization hook."""
    s = _store()
    cfg = Config.from_env()
    llm = AnthropicLLM(cfg.anthropic_api_key)
    import httpx

    client = httpx.Client(follow_redirects=True)
    for lead in s.get_leads(LeadStatus.NEW)[:limit]:
        s.add_enrichment(lead.id, enrich_lead(lead, llm, client))
    typer.echo("enriched")


@app.command()
def draft(limit: int = 50):
    """Draft emails for ENRICHED leads."""
    s = _store()
    cfg = Config.from_env()
    llm = AnthropicLLM(cfg.anthropic_api_key)
    footer = build_footer(cfg)
    for lead in s.get_leads(LeadStatus.ENRICHED)[:limit]:
        e = _enrichment_for(s, lead.id)
        s.add_draft(lead.id, build_draft(lead, e, DEFAULT_TEMPLATE, footer, llm))
    typer.echo("drafted")


def _enrichment_for(s: Store, lead_id: int):
    from outreach.models import Enrichment

    with s._conn() as c:
        r = c.execute("SELECT hook, signals FROM enrichment WHERE lead_id = ?", (lead_id,)).fetchone()
    if not r:
        return Enrichment(hook="")
    import json

    return Enrichment(hook=r["hook"] or "", signals=json.loads(r["signals"] or "{}"))


@app.command()
def review():
    """Launch the local review queue at http://127.0.0.1:8848."""
    import uvicorn

    from outreach.config import Config
    from outreach.mailbox.smtp_adapter import SmtpAdapter
    from outreach.web.app import create_app

    cfg = Config.from_env()
    app_ = create_app(_store(), SmtpAdapter(cfg), cfg)
    uvicorn.run(app_, host="127.0.0.1", port=8848)


@app.command()
def suppress(email: str):
    """Add an email to the suppression list."""
    _store().add_suppression(email, reason="manual")
    typer.echo(f"suppressed {email}")


@app.command()
def stats():
    """Show counts by status."""
    s = _store()
    counts = {st.value: len(s.get_leads(st)) for st in LeadStatus}
    typer.echo("leads by status: " + ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    app()
```

- [ ] **Step 4: Write `README.md`**

```markdown
# Outreach

Local-first lead store + cold-email assist. Source leads, AI-enrich and draft
personalized emails, then review, approve, and send each from your own mailbox
with CAN-SPAM compliance and a daily cap.

## Setup

    python3 -m venv .venv && . .venv/bin/activate
    pip install -e ".[dev]"
    cp .env.example .env   # then fill it in

Required env (see outreach/config.py): OUTREACH_SENDER_NAME, OUTREACH_SENDER_EMAIL,
OUTREACH_PHYSICAL_ADDRESS, ANTHROPIC_API_KEY, OUTREACH_SMTP_HOST,
OUTREACH_SMTP_PORT, OUTREACH_SMTP_USER, OUTREACH_SMTP_PASSWORD. Optional:
OUTREACH_DAILY_CAP (default 30), OUTREACH_DB (default data/outreach.db).

## Use

    python -m outreach.cli init
    python -m outreach.cli source leads.csv
    python -m outreach.cli enrich
    python -m outreach.cli draft
    python -m outreach.cli review     # opens the approve-and-send queue

CSV columns: business_name (required), website, email, contact_name, vertical, location.

Use a dedicated sending address, not your primary inbox. US CAN-SPAM is the target;
Canada/EU have stricter opt-in rules.
```

- [ ] **Step 5: Run the full suite**

Run: `pytest -q`
Expected: all tests pass (config, store, csv, compliance, draft, enrich, sender, web, cli).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: cli + readme; full v1 suite green"
```

---

## Self-Review

**Spec coverage:**
- Lead store (SQLite, all tables) -> Task 2. ✓
- Pluggable sourcing (CSV + Places stub) -> Task 3. ✓
- LLM enrichment (hook) -> Task 6; LLM interface -> Task 5. ✓
- Draft generation with footer -> Task 5. ✓
- Local web review queue (approve/edit/skip/send) -> Task 8. ✓
- Send via mailbox; SMTP adapter -> Task 7. ✓
- Send boundary: compliance validate, suppression, daily cap, idempotent -> Task 7. ✓
- Compliance footer + checks -> Task 4. ✓
- Suppression list -> Task 2 (store) + Task 4/7 (enforced). ✓
- CLI commands (init/source/enrich/draft/review/suppress/stats) -> Task 9. ✓
- Config (sender identity, address, cap, keys, smtp) -> Task 1. ✓
- pytest suite across modules -> Tasks 1-9. ✓
- Repo layout + scaffold -> Task 0. ✓

**Placeholder scan:** No TBD/TODO. The Places provider raising NotImplementedError is intentional and documented. No "handle edge cases" hand-waving.

**Type consistency:** `Store` method names (`add_leads`, `get_leads`, `get_lead`, `add_enrichment`, `add_draft`, `get_draft`, `update_draft`, `record_send`, `is_suppressed`, `add_suppression`, `count_sends_today`) are used identically in Tasks 7, 8, 9. `LeadStatus` members (NEW/ENRICHED/DRAFTED/SENT/SKIPPED/FAILED/SUPPRESSED/REPLIED/BOUNCED) are consistent. `build_draft(lead, enrichment, template, footer, llm)`, `enrich(lead, llm, http)`, `validate_sendable(draft, config)`, `build_footer(config)`, `send_lead(store, mailbox, config, lead_id)`, and `MailboxAdapter.send(to, subject, body) -> SendResult` signatures match across tasks. `Config` field set matches Task 1 across all `cfg()` test helpers.

**Note:** `cli.py` depends on the `_enrichment_for` helper and `Store._conn`; both are defined (Task 9 and Task 2 respectively). Run the full suite (Task 9 Step 5) as the final gate.
