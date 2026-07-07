# Local Network Hosting

The app is intended to run on one host computer and be opened from other devices on the same local network. Docker Compose is the recommended deployment because it is reproducible and keeps checklist progress in a host-mounted `data` directory.

## Recommended Docker Command

```bash
docker compose up -d
```

This builds the React app, starts the shared server in a container, and publishes it on normal HTTP port `80`.

Open it from the host machine:

```text
http://localhost
```

Open it from another device on the same local network:

```text
http://HOST-IP
```

Stop it with:

```bash
docker compose down
```

## Preferred Hostname

For bare hostname access:

```text
http://livingdex
```

configure your router or local DNS server to resolve `livingdex` to the host computer's LAN IP address.

Example local DNS entry:

```text
livingdex -> 192.168.1.50
```

Docker starts the app, but the router or local DNS server provides the LAN hostname. If your router does not support local DNS names, use Pi-hole, AdGuard Home, dnsmasq, or per-device hosts files.

## Manual Node Command

If you do not want Docker, install dependencies and run:

```bash
npm run shared:lan
```

This builds the React app and starts the shared server on port `4173`.

## Find Your Host IP

On Linux:

```bash
hostname -I
```

Use the IPv4 address, usually something like:

```text
192.168.1.50
192.168.178.49
10.0.0.25
```

## Open From A Phone

1. Connect the phone to the same Wi-Fi as the host computer.
2. Open Chrome, Safari, or another browser.
3. Visit `http://HOST-IP` when using Docker, or `http://HOST-IP:4173` when using the manual Node server.

Example:

```text
http://192.168.178.49
```

## Firewall

If another device cannot connect to the Docker deployment, allow HTTP:

```bash
sudo ufw allow 80/tcp
```

For the manual Node server, allow the app port:

```bash
sudo ufw allow 4173/tcp
```

## Notes

- This is local-network hosting, not public internet hosting.
- Devices must be on the same network unless you intentionally configure VPN, reverse proxy, or port forwarding.
- Avoid exposing this app directly to the public internet without adding authentication and hardening.
