# Troubleshooting

## Phone Cannot Connect

Check that the phone is on the same Wi-Fi as the host computer.

Find the host IP:

```bash
hostname -I
```

Open:

```text
http://HOST-IP:4173
```

Allow the port if the firewall blocks it:

```bash
sudo ufw allow 4173/tcp
```

## Port Already In Use

If you see `EADDRINUSE`, another server is already using port `4173`.

Check listening ports:

```bash
ss -ltnp
```

Stop the old process or run the server on another port:

```bash
PORT=4183 npm run serve:lan
```

## Changes Do Not Show Up

If code changed but the browser still shows the old app, rebuild and restart shared mode:

```bash
npm run shared:lan
```

Then refresh the browser.

## PokeAPI Update Fails

Check internet connectivity and retry:

```bash
npm run update:pokedex
```

PokeAPI or network interruptions can cause generation to fail. The existing generated files remain until overwritten.

## Node Or npm Missing

Install Node.js and npm:

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## Reset Checklist Progress

Stop the server, replace `data/living-dex-state.json` with:

```json
{
  "owned": {}
}
```

Start the server again.
