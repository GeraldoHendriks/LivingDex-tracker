# Roadmap

## Near Term

- Saved views: let users save common filter/sort combinations like "Gen 3 missing" or "Owned legendaries".
- Missing-only quick mode: add a focused checklist view for completing gaps faster on mobile.
- Import/export progress: support JSON backup and restore from the UI in addition to the shared state file.
- Progress by generation: show completion cards for each generation, not just the currently selected filter.
- Offline fallback state: keep usable local progress when the shared server is unreachable, then reconcile when reconnected.

## Mid Term

- Forms and variants tracking: support regional forms, gender differences, Gigantamax, Mega Evolution, and other collectible variants.
- Game/location notes: let users add where each Pokemon was caught, traded from, or stored.
- Shiny living dex mode: add a separate shiny ownership checklist.
- Multi-profile support: allow multiple household members or save files to track separate progress.
- Advanced search: filter by type, dual type, ability, evolution method, legendary/mythical status, and base stat ranges.

## Long Term

- Team builder helper: use the existing type chart and Pokemon details to suggest coverage and defensive gaps.
- PokeAPI data refresh UI: expose data update status and last refreshed date in the app.
- Authentication or trusted-device mode: protect shared household progress on larger local networks.
- Cloud or remote sync option: optional sync beyond the local network while keeping local-first behavior.
- Collection analytics: show hardest-to-complete generations, type distribution, completion trends, and recent changes.

## Quality And Maintenance

- Add automated tests for filtering, sorting, ownership sync, and type matchup calculations.
- Improve accessibility for the detail dialog, keyboard navigation, focus trapping, and screen reader announcements.
- Add state migration/versioning for future changes to `data/living-dex-state.json`.
- Split the main app into smaller components once new features make `App.tsx` harder to maintain.
