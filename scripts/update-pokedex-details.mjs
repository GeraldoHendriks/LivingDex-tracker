import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const detailsFile = join(rootDir, 'src', 'data', 'pokemonDetails.ts');
const typeChartFile = join(rootDir, 'src', 'data', 'typeChart.ts');
const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species?limit=2000';

function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function escapeString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

function cleanText(value) {
  return value.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
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
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

function chainNodeToNames(node) {
  // Flatten branching evolution trees into readable paths for the detail drawer.
  const current = titleCase(node.species.name);
  if (!node.evolves_to.length) return [current];

  return node.evolves_to.flatMap((child) => chainNodeToNames(child).map((chain) => `${current} -> ${chain}`));
}

function renderValue(value) {
  if (Array.isArray(value)) return `[${value.map(renderValue).join(', ')}]`;
  if (value && typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([key, entry]) => `'${escapeString(key)}': ${renderValue(entry)}`)
      .join(', ')} }`;
  }
  if (typeof value === 'string') return `'${escapeString(value)}'`;
  return String(value);
}

async function buildDetails(summary) {
  // Detail data is generated ahead of time to keep the app fast on phones and tablets.
  const species = await fetchJson(summary.url);
  const defaultVariety = species.varieties.find((variety) => variety.is_default) ?? species.varieties[0];
  const pokemon = await fetchJson(defaultVariety.pokemon.url);
  const flavor = species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text ?? '';
  const evolutionChain = await fetchJson(species.evolution_chain.url);

  return {
    id: species.id,
    height: pokemon.height,
    weight: pokemon.weight,
    sprite: pokemon.sprites.front_default ?? '',
    artwork: pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default ?? '',
    abilities: pokemon.abilities.map((entry) => titleCase(entry.ability.name)),
    stats: Object.fromEntries(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat])),
    flavorText: cleanText(flavor),
    evolutionChains: chainNodeToNames(evolutionChain.chain),
  };
}

function renderDetailsFile(entries) {
  const rows = entries.map((entry) => `  ${entry.id}: ${renderValue(entry)},`);
  return `export type PokemonDetail = {\n  id: number;\n  height: number;\n  weight: number;\n  sprite: string;\n  artwork: string;\n  abilities: string[];\n  stats: Record<string, number>;\n  flavorText: string;\n  evolutionChains: string[];\n};\n\nexport const pokemonDetails: Record<number, PokemonDetail> = {\n${rows.join('\n')}\n};\n`;
}

async function buildTypeChart() {
  // PokeAPI exposes matchups per type; the frontend combines them for dual-type Pokemon.
  const typeList = await fetchJson('https://pokeapi.co/api/v2/type');
  const typeSummaries = typeList.results.filter((type) => !['unknown', 'shadow'].includes(type.name));
  const types = await mapWithConcurrency(typeSummaries, 6, async (summary) => fetchJson(summary.url));

  return types
    .map((type) => ({
      name: titleCase(type.name),
      attacking: {
        double: type.damage_relations.double_damage_to.map((entry) => titleCase(entry.name)),
        half: type.damage_relations.half_damage_to.map((entry) => titleCase(entry.name)),
        none: type.damage_relations.no_damage_to.map((entry) => titleCase(entry.name)),
      },
      defending: {
        double: type.damage_relations.double_damage_from.map((entry) => titleCase(entry.name)),
        half: type.damage_relations.half_damage_from.map((entry) => titleCase(entry.name)),
        none: type.damage_relations.no_damage_from.map((entry) => titleCase(entry.name)),
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderTypeChartFile(entries) {
  const rows = entries.map((entry) => `  ${renderValue(entry)},`);
  return `export type TypeMatchup = {\n  name: string;\n  attacking: { double: string[]; half: string[]; none: string[] };\n  defending: { double: string[]; half: string[]; none: string[] };\n};\n\nexport const typeChart: TypeMatchup[] = [\n${rows.join('\n')}\n];\n`;
}

async function main() {
  const speciesList = await fetchJson(speciesUrl);
  const summaries = speciesList.results
    .map((summary) => ({ ...summary, id: Number(summary.url.match(/pokemon-species\/(\d+)\//)?.[1]) }))
    .filter((summary) => Number.isInteger(summary.id))
    .sort((a, b) => a.id - b.id);

  console.log(`Fetching detailed data for ${summaries.length} Pokemon...`);
  const details = await mapWithConcurrency(summaries, 8, buildDetails);
  const sortedDetails = details.sort((a, b) => a.id - b.id);
  const typeChart = await buildTypeChart();

  await mkdir(dirname(detailsFile), { recursive: true });
  await writeFile(detailsFile, renderDetailsFile(sortedDetails));
  await writeFile(typeChartFile, renderTypeChartFile(typeChart));

  console.log(`Wrote ${sortedDetails.length} detail records to ${detailsFile}`);
  console.log(`Wrote ${typeChart.length} type records to ${typeChartFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
