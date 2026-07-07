# Local Network Hosting

The app is intended to run on one host computer and be opened from other devices on the same local network.

## Recommended Command

```bash
cd /home/hades/Pokedex
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
3. Visit `http://HOST-IP:4173`.

Example:

```text
http://192.168.178.49:4173
```

## Firewall

If another device cannot connect, allow the app port:

```bash
sudo ufw allow 4173/tcp
```

## Notes

- This is local-network hosting, not public internet hosting.
- Devices must be on the same network unless you intentionally configure VPN, reverse proxy, or port forwarding.
- Avoid exposing this app directly to the public internet without adding authentication and hardening.
