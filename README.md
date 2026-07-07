# Living Dex Pokedex

A local-network Pokedex and living dex tracker for households, collectors, and completionists. It combines a shared checklist, live updates between devices, generated National Dex data, Pokemon detail views, evolution chains, and type matchup cheat sheets.

The app is designed to run from one computer on your local network and be opened from phones, tablets, or other computers on the same Wi-Fi.

## Features

- Track owned/missing status for generated National Dex Pokemon.
- Share one checklist across multiple devices on your local network.
- Receive live entry updates when another connected device changes a Pokemon.
- Search by name or National Dex number.
- Filter by generation and ownership status.
- Sort by dex number, name, generation, or owned-first.
- Open Pokemon detail cards with artwork, profile data, stats, flavor text, type matchups, and evolution chains.
- Use the built-in type matchup cheat sheet for quick battle reference.
- Generate local Pokemon data from PokeAPI for fast offline use after setup.
- Responsive Pokedex-style interface for desktop and mobile.

## Quick Start

Install dependencies:

```bash
npm install
```

Run the shared LAN app:

```bash
npm run shared:lan
```

Open the app from the host machine or another device on the same Wi-Fi:

```text
http://YOUR-COMPUTER-IP:4173
```

Find your local IP on Linux:

```bash
hostname -I
```

## Common Scripts

```bash
npm run dev          # Frontend-only development server
npm run dev:lan      # Frontend development server exposed on LAN
npm run dev:api      # Shared API/static server for development
npm run build        # Type-check and build production assets
npm run serve:lan    # Serve an existing production build on LAN
npm run shared:lan   # Build and serve the shared LAN app
npm run update:pokemon
npm run update:pokedex
```

## Shared Progress

Shared mode stores checklist progress on the host computer in:

```text
data/living-dex-state.json
```

Back up that file if you want to preserve progress before moving machines or experimenting.

## PokeAPI Data Updates

Refresh the local Pokemon list from PokeAPI:

```bash
npm run update:pokemon
```

Refresh the full local Pokedex data, including details, type matchups, and evolution chains:

```bash
npm run update:pokedex
```

Then rebuild/restart the shared server:

```bash
npm run shared:lan
```

Checklist progress is stored by National Dex number, so existing tracked Pokemon remain checked after updating generated data.

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Local Network Hosting](docs/LOCAL_NETWORK_HOSTING.md)
- [Shared Sync](docs/SHARED_SYNC.md)
- [PokeAPI Data](docs/POKEAPI_DATA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Contributing](docs/CONTRIBUTING.md)

## Notices

This is an unofficial fan project. Pokemon names, images, and related marks belong to their respective owners. Pokemon data is sourced from [PokeAPI](https://pokeapi.co/).

AI assistance was used during creation of this project. See [NOTICE.md](NOTICE.md) for details.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
