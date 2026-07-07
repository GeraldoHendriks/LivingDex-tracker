# Changelog

## Unreleased

- Added detailed evolution chains with level and special evolution requirements.
- Added clickable evolution stages in the Pokemon detail drawer with sprites for quick navigation.
- Added Docker start-up frontend rebuilds from mounted source so `docker restart livingdex` applies UI and generated data changes.
- Added static asset cache headers so rebuilt Docker deployments revalidate the app shell correctly.
