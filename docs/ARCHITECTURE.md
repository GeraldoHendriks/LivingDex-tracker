# Architecture

The project is a Vite React app with a small Node.js server for shared local-network state.

## Frontend

Main files:

```text
src/App.tsx
src/main.tsx
src/styles.css
src/data/
```

The frontend handles:

- living dex UI
- filtering and sorting
- Pokemon detail drawer
- type matchup cheat sheet
- live sync subscription
- owned/missing updates

## Backend

Main file:

```text
server/server.mjs
```

The backend handles:

- serving the production frontend from `dist/`
- reading and writing `data/living-dex-state.json`
- broadcasting live updates through Server-Sent Events

## Generated Data

Generator scripts:

```text
scripts/update-pokemon.mjs
scripts/update-pokedex-details.mjs
```

Generated output:

```text
src/data/pokemon.ts
src/data/pokemonDetails.ts
src/data/typeChart.ts
```

The app imports generated data directly, so normal usage does not require PokeAPI access.

## Build And Serve Flow

`npm run shared:lan` runs:

```bash
npm run build && node server/server.mjs
```

Vite writes production assets to `dist/`, then the Node server serves those files and the shared API on port `4173`.

## Design Decisions

- Shared state is stored as JSON for transparency and easy backups.
- Server-Sent Events are used for live updates because the app only needs server-to-client broadcasts.
- Generated static PokeAPI data keeps LAN usage fast and reliable.
- The tracker stores ownership by National Dex number so generated data can be refreshed without losing progress.
