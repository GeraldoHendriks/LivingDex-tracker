# Docker Deployment

Docker Compose is the recommended way to run Living Dex Tracker on a local network. The container serves the built app and shared API, while checklist progress stays on the host machine in `data/living-dex-state.json`.

## Requirements

- Docker Engine with Docker Compose support.
- Port `80` available on the host machine.
- A router or local DNS server if you want the bare hostname `livingdex`.

## Start The App

From the project directory:

```bash
docker compose up -d
```

This builds the image if needed and starts the container in the background.

Open the app on the host:

```text
http://localhost
```

Open the app from another device on the same network:

```text
http://HOST-IP
```

## Use The `livingdex` Hostname

Docker publishes the app on the host machine, but your network must resolve the name `livingdex` to that host machine.

Recommended setup:

1. Reserve a stable DHCP address for the host machine in your router.
2. Add a local DNS or hostname entry in your router:

```text
livingdex -> HOST-LAN-IP
```

Example:

```text
livingdex -> 192.168.1.50
```

Then open:

```text
http://livingdex
```

If your router cannot create local DNS names, alternatives are Pi-hole, AdGuard Home, dnsmasq, or per-device hosts files.

## Stop The App

```bash
docker compose down
```

## Apply Code Changes

The Compose setup bind-mounts the frontend source into the container and rebuilds the frontend whenever the container starts. After editing UI or generated data files, restart the container:

```bash
docker restart livingdex
```

If you changed Docker configuration, dependencies, or package files, rebuild and recreate the container:

```bash
docker compose build
docker compose up -d
```

After pulling this Docker setup for the first time, run the rebuild command once so the existing container gets the new restart behavior.

## Persistent Data

Checklist progress is bind-mounted from the host:

```text
./data:/app/data
```

The state file is:

```text
data/living-dex-state.json
```

Back it up before moving hosts or resetting the deployment.

## Port 80 Conflicts

The default deployment maps normal HTTP port `80` to the app:

```yaml
ports:
  - "80:4173"
```

If another service already uses port `80`, change `compose.yaml` to:

```yaml
ports:
  - "4173:4173"
```

Then access the app with:

```text
http://livingdex:4173
```

## Firewall

Allow HTTP traffic to the host if other devices cannot connect:

```bash
sudo ufw allow 80/tcp
```
