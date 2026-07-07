import { useEffect, useMemo, useRef, useState } from 'react';
import { pokemon } from './data/pokemon';
import { pokemonDetails } from './data/pokemonDetails';
import { typeChart } from './data/typeChart';

type OwnershipMap = Record<number, boolean>;
type SortKey = 'number' | 'name' | 'generation' | 'owned';
type OwnershipFilter = 'all' | 'owned' | 'missing';
type SyncState = 'loading' | 'connected' | 'saving' | 'offline';
type MatchupSummary = { weak: string[]; resist: string[]; immune: string[] };

const API_BASE =
  // Vite dev runs on 5173 while the shared API server runs on 4173; production uses one origin.
  window.location.port === '5173'
    ? `${window.location.protocol}//${window.location.hostname}:4173`
    : window.location.origin;
const highestDexNumber = Math.max(...pokemon.map((entry) => entry.id));

async function fetchOwned(signal?: AbortSignal): Promise<OwnershipMap> {
  const response = await fetch(`${API_BASE}/api/state`, { signal });
  if (!response.ok) throw new Error('Unable to load shared state');

  const state = (await response.json()) as { owned?: OwnershipMap };
  return state.owned ?? {};
}

async function saveOwned(owned: OwnershipMap): Promise<OwnershipMap> {
  const response = await fetch(`${API_BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owned }),
  });

  if (!response.ok) throw new Error('Unable to save shared state');

  const state = (await response.json()) as { owned?: OwnershipMap };
  return state.owned ?? owned;
}

function ownershipMapsMatch(a: OwnershipMap, b: OwnershipMap) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return aKeys.length === bKeys.length && aKeys.every((key) => Boolean(a[Number(key)]) === Boolean(b[Number(key)]));
}

function getDefensiveMatchups(types: string[]): MatchupSummary {
  // Combine defensive multipliers for dual-type Pokemon, including immunities.
  const multipliers = new Map(typeChart.map((entry) => [entry.name, 1]));

  for (const type of types) {
    const matchups = typeChart.find((entry) => entry.name === type);
    if (!matchups) continue;

    for (const attackType of matchups.defending.double) {
      multipliers.set(attackType, (multipliers.get(attackType) ?? 1) * 2);
    }

    for (const attackType of matchups.defending.half) {
      multipliers.set(attackType, (multipliers.get(attackType) ?? 1) * 0.5);
    }

    for (const attackType of matchups.defending.none) {
      multipliers.set(attackType, 0);
    }
  }

  return {
    weak: Array.from(multipliers.entries()).filter(([, value]) => value > 1).map(([type]) => type),
    resist: Array.from(multipliers.entries()).filter(([, value]) => value > 0 && value < 1).map(([type]) => type),
    immune: Array.from(multipliers.entries()).filter(([, value]) => value === 0).map(([type]) => type),
  };
}

function App() {
  const [owned, setOwned] = useState<OwnershipMap>({});
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState('all');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const hasLoaded = useRef(false);
  const isSaving = useRef(false);
  const suppressNextSave = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchOwned(controller.signal)
      .then((sharedOwned) => {
        suppressNextSave.current = true;
        setOwned(sharedOwned);
        hasLoaded.current = true;
        setSyncState('connected');
      })
      .catch(() => {
        hasLoaded.current = true;
        setSyncState('offline');
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    if (suppressNextSave.current) {
      suppressNextSave.current = false;
      return;
    }

    isSaving.current = true;
    setSyncState('saving');

    saveOwned(owned)
      .then(() => setSyncState('connected'))
      .catch(() => setSyncState('offline'))
      .finally(() => {
        isSaving.current = false;
      });
  }, [owned]);

  useEffect(() => {
    let streamConnected = false;
    const events = new EventSource(`${API_BASE}/api/events`);

    events.addEventListener('open', () => {
      streamConnected = true;
      setSyncState('connected');
    });

    events.addEventListener('state', (event) => {
      const state = JSON.parse(event.data) as { owned?: OwnershipMap };
      const sharedOwned = state.owned ?? {};

      hasLoaded.current = true;
      setOwned((current) => {
        if (ownershipMapsMatch(current, sharedOwned)) return current;
        suppressNextSave.current = true;
        return sharedOwned;
      });
      setSyncState('connected');
    });

    events.addEventListener('error', () => {
      streamConnected = false;
      setSyncState('offline');
    });

    const interval = window.setInterval(() => {
      // The interval is a fallback for browsers/networks that drop the live event stream.
      if (isSaving.current || streamConnected) return;

      fetchOwned()
        .then((sharedOwned) => {
          setOwned((current) => {
            if (ownershipMapsMatch(current, sharedOwned)) return current;
            suppressNextSave.current = true;
            return sharedOwned;
          });
          setSyncState('connected');
        })
        .catch(() => setSyncState('offline'));
    }, 5000);

    return () => {
      events.close();
      window.clearInterval(interval);
    };
  }, []);

  const generations = useMemo(
    () => Array.from(new Set(pokemon.map((entry) => entry.generation))).sort((a, b) => a - b),
    [],
  );

  const progressPokemon =
    generationFilter === 'all'
      ? pokemon
      : pokemon.filter((entry) => entry.generation.toString() === generationFilter);
  const ownedCount = progressPokemon.filter((entry) => owned[entry.id]).length;
  const percentComplete = Math.round((ownedCount / progressPokemon.length) * 100);

  const visiblePokemon = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return pokemon
      .filter((entry) => {
        const matchesSearch =
          !normalizedSearch ||
          entry.name.toLowerCase().includes(normalizedSearch) ||
          entry.id.toString().includes(normalizedSearch) ||
          entry.id.toString().padStart(3, '0').includes(normalizedSearch);
        const matchesGeneration =
          generationFilter === 'all' || entry.generation.toString() === generationFilter;
        const isOwned = Boolean(owned[entry.id]);
        const matchesOwnership =
          ownershipFilter === 'all' ||
          (ownershipFilter === 'owned' && isOwned) ||
          (ownershipFilter === 'missing' && !isOwned);

        return matchesSearch && matchesGeneration && matchesOwnership;
      })
      .sort((a, b) => {
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        if (sortKey === 'generation') return a.generation - b.generation || a.id - b.id;
        if (sortKey === 'owned') return Number(Boolean(owned[b.id])) - Number(Boolean(owned[a.id])) || a.id - b.id;
        return a.id - b.id;
      });
  }, [generationFilter, owned, ownershipFilter, search, sortKey]);
  const selectedPokemon = selectedPokemonId ? pokemon.find((entry) => entry.id === selectedPokemonId) : undefined;
  const selectedDetails = selectedPokemonId ? pokemonDetails[selectedPokemonId] : undefined;
  const selectedMatchups = selectedPokemon ? getDefensiveMatchups(selectedPokemon.types) : undefined;

  function toggleOwned(id: number) {
    setOwned((current) => ({ ...current, [id]: !current[id] }));
  }

  function markVisibleOwned(value: boolean) {
    setOwned((current) => {
      const next = { ...current };
      for (const entry of visiblePokemon) next[entry.id] = value;
      return next;
    });
  }

  return (
    <main className="app-shell">
      <section className="pokedex-frame" aria-label="Living Dex Pokedex">
        <header className="pokedex-lid">
          <div className="sensor-cluster" aria-hidden="true">
            <span className="main-lens" />
            <span className="mini-light red" />
            <span className="mini-light yellow" />
            <span className="mini-light green" />
          </div>
          <div className="speaker-slits" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </header>

        <section className="hero">
          <div className="screen-panel">
            <div className="screen-chrome">
              <span />
              <span />
            </div>
            <div className="screen-display">
              <p className="eyebrow">National Dex</p>
              <h1>Living Dex Tracker</h1>
              <p className="hero-copy">
                Track what you own, find gaps fast, and keep Pokemon #001-
                {highestDexNumber.toString().padStart(3, '0')} organized from any device on your local
                network.
              </p>
            </div>
          </div>

          <aside className="progress-card" aria-label="Living dex completion">
            <div className="sync-row">
              <span className={`sync-led sync-${syncState}`} aria-hidden="true" />
              <small className="sync-status">{syncState}</small>
            </div>
            <strong>{percentComplete}%</strong>
            <span>{ownedCount} owned</span>
            <small>{progressPokemon.length - ownedCount} remaining</small>
            <div className="progress-bar" aria-hidden="true">
              <div style={{ width: `${percentComplete}%` }} />
            </div>
          </aside>
        </section>

        <section className="control-deck" aria-label="Pokedex controls">
          <div className="controls">
            <label className="search-control">
              Search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or number"
                type="search"
              />
            </label>

            <label>
              Generation
              <select value={generationFilter} onChange={(event) => setGenerationFilter(event.target.value)}>
                <option value="all">All generations</option>
                {generations.map((generation) => (
                  <option key={generation} value={generation}>
                    Gen {generation}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={ownershipFilter}
                onChange={(event) => setOwnershipFilter(event.target.value as OwnershipFilter)}
              >
                <option value="all">All Pokemon</option>
                <option value="owned">Owned</option>
                <option value="missing">Missing</option>
              </select>
            </label>

            <label>
              Sort
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value="number">Dex number</option>
                <option value="name">Name</option>
                <option value="generation">Generation</option>
                <option value="owned">Owned first</option>
              </select>
            </label>
          </div>

          <div className="bulk-actions" aria-label="Bulk actions">
            <span>{visiblePokemon.length} shown</span>
            <button type="button" onClick={() => markVisibleOwned(true)}>
              Mark shown owned
            </button>
            <button type="button" className="secondary" onClick={() => markVisibleOwned(false)}>
              Mark shown missing
            </button>
          </div>
        </section>
      </section>

      <section className="reference-panel" aria-label="Pokedex cheat sheets">
        <div className="reference-heading">
          <p className="eyebrow">Trainer Cheat Sheet</p>
          <h2>Type Matchups</h2>
          <p>Quick reference for attacking and defending. Open a Pokemon card for its calculated weaknesses and resistances.</p>
        </div>
        <div className="type-chart-grid">
          {typeChart.map((entry) => (
            <article className="type-chart-card" key={entry.name}>
              <span className={`type-pill type-${entry.name.toLowerCase()}`}>{entry.name}</span>
              <dl>
                <div>
                  <dt>Hits hard</dt>
                  <dd>{entry.attacking.double.length ? entry.attacking.double.join(', ') : 'None'}</dd>
                </div>
                <div>
                  <dt>Weak to</dt>
                  <dd>{entry.defending.double.length ? entry.defending.double.join(', ') : 'None'}</dd>
                </div>
                <div>
                  <dt>Immune to</dt>
                  <dd>{entry.defending.none.length ? entry.defending.none.join(', ') : 'None'}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="dex-grid" aria-label="Pokemon list">
        {visiblePokemon.map((entry) => {
          const isOwned = Boolean(owned[entry.id]);

          return (
            <article
              className={isOwned ? 'pokemon-card owned' : 'pokemon-card'}
              key={entry.id}
              onClick={() => setSelectedPokemonId(entry.id)}
            >
              <div className="pokemon-topline">
                <span className="dex-number">#{entry.id.toString().padStart(3, '0')}</span>
                <span className="generation-pill">Gen {entry.generation}</span>
              </div>
              {pokemonDetails[entry.id]?.sprite ? (
                <img className="pokemon-sprite" src={pokemonDetails[entry.id].sprite} alt="" loading="lazy" />
              ) : null}
              <h2>{entry.name}</h2>
              <div className="type-row">
                {entry.types.map((type) => (
                  <span className={`type-pill type-${type.toLowerCase()}`} key={type}>
                    {type}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className={isOwned ? 'owned-toggle active' : 'owned-toggle'}
                aria-pressed={isOwned}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOwned(entry.id);
                }}
              >
                {isOwned ? 'Owned' : 'Missing'}
              </button>
            </article>
          );
        })}
      </section>

      {selectedPokemon && selectedDetails && selectedMatchups ? (
        <section className="detail-backdrop" role="dialog" aria-modal="true" aria-label={`${selectedPokemon.name} details`}>
          <div className="detail-drawer">
            <button className="detail-close" type="button" onClick={() => setSelectedPokemonId(null)}>
              Close
            </button>
            <div className="detail-hero">
              <div>
                <span className="dex-number">#{selectedPokemon.id.toString().padStart(3, '0')}</span>
                <h2>{selectedPokemon.name}</h2>
                <div className="type-row">
                  {selectedPokemon.types.map((type) => (
                    <span className={`type-pill type-${type.toLowerCase()}`} key={type}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              {selectedDetails.artwork ? <img src={selectedDetails.artwork} alt={selectedPokemon.name} /> : null}
            </div>

            <p className="flavor-text">{selectedDetails.flavorText || 'No field notes available.'}</p>

            <div className="detail-grid">
              <article>
                <h3>Profile</h3>
                <p>Height: {(selectedDetails.height / 10).toFixed(1)} m</p>
                <p>Weight: {(selectedDetails.weight / 10).toFixed(1)} kg</p>
                <p>Abilities: {selectedDetails.abilities.join(', ')}</p>
              </article>

              <article>
                <h3>Defensive Typing</h3>
                <p><strong>Weak:</strong> {selectedMatchups.weak.length ? selectedMatchups.weak.join(', ') : 'None'}</p>
                <p><strong>Resists:</strong> {selectedMatchups.resist.length ? selectedMatchups.resist.join(', ') : 'None'}</p>
                <p><strong>Immune:</strong> {selectedMatchups.immune.length ? selectedMatchups.immune.join(', ') : 'None'}</p>
              </article>

              <article className="stats-card">
                <h3>Base Stats</h3>
                {Object.entries(selectedDetails.stats).map(([stat, value]) => (
                  <div className="stat-row" key={stat}>
                    <span>{stat.replace('-', ' ')}</span>
                    <meter min="0" max="255" value={value} />
                    <strong>{value}</strong>
                  </div>
                ))}
              </article>

              <article className="evolution-card">
                <h3>Evolution Chain</h3>
                {selectedDetails.evolutionChains.map((chain) => (
                  <div className="evolution-chain" key={chain.map((stage) => stage.id).join('-')}>
                    {chain.map((stage, index) => {
                      const details = pokemonDetails[stage.id];

                      return (
                        <div className="evolution-step" key={`${stage.id}-${index}`}>
                          {stage.condition ? <span className="evolution-condition">{stage.condition}</span> : null}
                          <button
                            type="button"
                            className={stage.id === selectedPokemon.id ? 'evolution-stage active' : 'evolution-stage'}
                            onClick={() => setSelectedPokemonId(stage.id)}
                          >
                            {details?.sprite ? <img src={details.sprite} alt="" loading="lazy" /> : null}
                            <span className="dex-number">#{stage.id.toString().padStart(3, '0')}</span>
                            <strong>{stage.name}</strong>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </article>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default App;
