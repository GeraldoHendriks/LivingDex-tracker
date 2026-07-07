# PokeAPI Data

The project uses PokeAPI as a data source during generation, not during normal app usage.

## Why Generate Local Data

- Faster loading on phones.
- Reliable use when PokeAPI is unavailable.
- No repeated API calls during normal local-network use.
- Easier to review generated app behavior.

## Scripts

Update the basic Pokemon list:

```bash
npm run update:pokemon
```

Update the full Pokedex dataset:

```bash
npm run update:pokedex
```

`update:pokedex` runs the basic list update and then generates detail data, type chart data, and evolution chains.

## Generated Files

```text
src/data/pokemon.ts
src/data/pokemonDetails.ts
src/data/typeChart.ts
```

## Current Scope

The generated Pokemon list targets standard National Dex species. It does not currently include a separate tracker entry for every alternate form, regional form, mega, gigantamax, or shiny variant.

## Data Source Notice

PokeAPI data is community-maintained. If a Pokemon, ability, sprite, or flavor text looks incorrect, first check whether the upstream PokeAPI response has changed.
