import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const outputFile = join(rootDir, 'src', 'data', 'pokemon.ts');
const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species?limit=2000';

const generationNumbers = {
  'generation-i': 1,
  'generation-ii': 2,
  'generation-iii': 3,
  'generation-iv': 4,
  'generation-v': 5,
  'generation-vi': 6,
  'generation-vii': 7,
  'generation-viii': 8,
  'generation-ix': 9,
};

const nameOverrides = {
  'nidoran-f': 'Nidoran Female',
  'nidoran-m': 'Nidoran Male',
  'farfetchd': "Farfetch'd",
  'sirfetchd': "Sirfetch'd",
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  'ho-oh': 'Ho-Oh',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'great-tusk': 'Great Tusk',
  'scream-tail': 'Scream Tail',
  'brute-bonnet': 'Brute Bonnet',
  'flutter-mane': 'Flutter Mane',
  'slither-wing': 'Slither Wing',
  'sandy-shocks': 'Sandy Shocks',
  'iron-treads': 'Iron Treads',
  'iron-bundle': 'Iron Bundle',
  'iron-hands': 'Iron Hands',
  'iron-jugulis': 'Iron Jugulis',
  'iron-moth': 'Iron Moth',
  'iron-thorns': 'Iron Thorns',
  'roaring-moon': 'Roaring Moon',
  'iron-valiant': 'Iron Valiant',
  'walking-wake': 'Walking Wake',
  'iron-leaves': 'Iron Leaves',
  'gouging-fire': 'Gouging Fire',
  'raging-bolt': 'Raging Bolt',
  'iron-boulder': 'Iron Boulder',
  'iron-crown': 'Iron Crown',
};

function toTitleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatName(species) {
  if (nameOverrides[species.name]) return nameOverrides[species.name];

  const englishName = species.names.find((entry) => entry.language.name === 'en')?.name;
  if (englishName && /^[\x20-\x7e]+$/.test(englishName)) return englishName;

  return toTitleCase(species.name);
}

function formatType(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);

  return response.json();
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

async function buildPokemonEntry(summary) {
  // Only default varieties become checklist entries; alternate forms can be added as a future mode.
  const species = await fetchJson(summary.url);
  const id = species.id;
  const generation = generationNumbers[species.generation.name];
  const defaultVariety = species.varieties.find((variety) => variety.is_default) ?? species.varieties[0];
  const pokemon = await fetchJson(defaultVariety.pokemon.url);
  const types = pokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => formatType(entry.type.name));

  if (!generation) throw new Error(`Unknown generation for ${species.name}: ${species.generation.name}`);

  return {
    id,
    name: formatName(species),
    generation,
    types,
  };
}

function renderPokemonFile(entries) {
  // The app imports generated TypeScript so normal LAN usage does not depend on PokeAPI availability.
  const rows = entries.map(
    (entry) =>
      `  { id: ${entry.id}, name: '${escapeString(entry.name)}', generation: ${entry.generation}, types: [${entry.types
        .map((type) => `'${escapeString(type)}'`)
        .join(', ')}] },`,
  );

  return `export type Pokemon = {\n  id: number;\n  name: string;\n  generation: number;\n  types: string[];\n};\n\nexport const pokemon: Pokemon[] = [\n${rows.join('\n')}\n];\n`;
}

async function main() {
  const speciesList = await fetchJson(speciesUrl);
  const summaries = speciesList.results
    .map((summary) => ({ ...summary, id: Number(summary.url.match(/pokemon-species\/(\d+)\//)?.[1]) }))
    .filter((summary) => Number.isInteger(summary.id))
    .sort((a, b) => a.id - b.id);

  console.log(`Fetching ${summaries.length} Pokemon species from PokeAPI...`);
  const entries = await mapWithConcurrency(summaries, 10, buildPokemonEntry);
  const sortedEntries = entries.sort((a, b) => a.id - b.id);

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, renderPokemonFile(sortedEntries));

  const lastEntry = sortedEntries.at(-1);
  console.log(`Wrote ${sortedEntries.length} Pokemon to ${outputFile}`);
  console.log(`Latest dex entry: #${lastEntry.id} ${lastEntry.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
