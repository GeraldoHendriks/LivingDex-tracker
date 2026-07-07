# Contributing

Contributions are welcome. Keep the app practical, easy to use, and reliable on a local network.

## Development Setup

```bash
npm install
npm run dev
```

For frontend plus shared API development, run these in two terminals:

```bash
npm run dev:lan
```

```bash
npm run dev:api
```

## Before Submitting Changes

Run:

```bash
npm run build
npm audit --audit-level=moderate
```

## Generated Data

If you change PokeAPI generation logic, regenerate data:

```bash
npm run update:pokedex
```

Review generated files before committing.

## Code Style

- Prefer small, focused changes.
- Keep user flows simple for novice users.
- Preserve power-user speed: search, filtering, sorting, and bulk actions should stay fast.
- Add comments only where behavior is not obvious.
- Do not add external services for normal app usage unless there is a clear need.

## Project Notices

Keep `NOTICE.md` accurate when adding new external data sources, assets, or generated content.
