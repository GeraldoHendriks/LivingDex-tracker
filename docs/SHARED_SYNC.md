# Shared Sync

Shared mode lets multiple browsers use the same living dex checklist.

## State File

Progress is stored on the host computer in:

```text
data/living-dex-state.json
```

The file maps National Dex numbers to boolean owned/missing values.

## API Endpoints

`GET /api/state`

Returns the current shared checklist state.

`PUT /api/state`

Writes the shared checklist state.

`GET /api/events`

Opens a Server-Sent Events stream for live updates.

## Live Updates

When a device saves a change, the server writes `data/living-dex-state.json` and broadcasts the new state to all connected browsers through `/api/events`.

If the event stream drops, the frontend falls back to periodic checks until the live stream reconnects.

## Backup

Back up this file to preserve progress:

```bash
cp data/living-dex-state.json data/living-dex-state.backup.json
```

## Restore

Stop the server, replace `data/living-dex-state.json`, then start the server again.

## Reset Progress

Stop the server and replace the state file with:

```json
{
  "owned": {}
}
```
