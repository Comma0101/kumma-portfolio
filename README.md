# Kumma

Kumma Wu’s personal site explores consciousness, self-awareness, and how understanding enters everyday life. The main experience uses paper, continuous red ink, variable typography, Chinese text, and brushwork across eight personal chapters. Software projects have their own Work pages; essays and reading references live under Writing.

## Run locally

Use Node.js and npm. The Node version used by the deployment workflow is recorded in `.github/workflows/deploy.yml`.

```sh
npm ci
npm run dev
```

The development server runs at `http://localhost:4242`. To use another port:

```sh
npm run dev -- --port 4243
```

## Architecture

- `app/`: Next.js App Router routes and metadata. `/` is the primary personal site; `/work`, `/notes`, and `/studies` hold work, writing, and browser-rendered visual studies. `/view` is a retained noindex experiment.
- `components/personal/`: the paper design system, eight-chapter sequence, ink geometry, portrait, typography, interactions, and shared page shell.
- `components/seo/JsonLd.tsx`: public identity and website structured data.
- `_posts/`: Markdown essays, with Chinese editions under `_posts/zh/`.
- `public/`: fonts, assets, and the `llms.txt` / `llms-full.txt` identity summaries.
- `scripts/`: share-image generation and visual/font authoring tools. `npm run build` regenerates `public/og/` through `prebuild`.
- `PRODUCT.md`, `DESIGN.md`, and `.impeccable/surfaces/`: product truths, visual conventions, and surface-specific intent.
- `components/personal/routes.ts`: paper routes and destinations for retired addresses.

Next.js 14, React 18, TypeScript, CSS Modules, GSAP, SVG, Canvas, and `perfect-freehand` support the main experience. Production uses static export with trailing slashes; generated files live in `out/`.

## Verify changes

```sh
npm test
./node_modules/.bin/tsc --noEmit --incremental false --target es2020
```

Run the local ESLint configuration against the changed TypeScript files. For example:

```sh
ESLINT_USE_FLAT_CONFIG=false ./node_modules/.bin/eslint --no-eslintrc --config .eslintrc.json app/page.tsx components/personal/Opening.tsx
```

The legacy `npm run lint` command can encounter a parent-checkout plugin conflict in nested worktrees. The explicit local-config command avoids that resolution path. Standalone type checking uses ES2020 to match the test compilation target and include the repository’s regular-expression tests. Production builds skip ESLint in `next.config.mjs`, so lint remains a separate check.

Stop the development server before building; both commands use `.next/`.

```sh
npm run build
python3 -m http.server 4242 --bind 127.0.0.1 --directory out
```

Before publication, inspect the built site in a real browser at desktop and phone widths. Exercise the chapter interactions and keyboard alternatives, reduced-motion and no-JavaScript reading, Work/Writing/contact paths, language editions, and retired URLs. Check exported metadata, structured data, share images, horizontal overflow, and console errors. Review the final diff for unrelated files.

## Publication

`.github/workflows/deploy.yml` runs on pushes to `master` and through manual dispatch. It installs dependencies, runs the static build, uploads `out/`, and deploys that artifact to GitHub Pages. The custom domain is `kumma.me`.

The rich `/` experience is the primary replacement site. `/view` remains an optional noindex comparison, with no project showcase on the main journey. A local build or publication instruction does not establish deployment success: verify the workflow result and the live domain after publishing.
