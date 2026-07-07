# Getting Started

This guide gets the Living Dex Pokedex running on Linux Mint or another Linux machine.

## Requirements

- Node.js 18 or newer.
- npm.
- A local network if you want to access the app from phones or other computers.

## Install Node.js On Linux Mint

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node --version
npm --version
```

## Install Project Dependencies

From the project directory:

```bash
cd /home/hades/Pokedex
npm install
```

## Run Shared Mode

Shared mode is the recommended way to use the app with multiple people or multiple devices.

```bash
npm run shared:lan
```

Open the app at:

```text
http://YOUR-COMPUTER-IP:4173
```

## Run Frontend-Only Development Mode

Use this when working on only the React frontend:

```bash
npm run dev
```

This mode does not provide shared checklist storage unless the API server is also running.

## Update Pokedex Data

Refresh all generated Pokemon data from PokeAPI:

```bash
npm run update:pokedex
```

Then restart shared mode:

```bash
npm run shared:lan
```
