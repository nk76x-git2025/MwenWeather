import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { createLogId } from './logIds';
import { getRecommendation } from './recommendations';
import { buildExport, getLogs, parseExport, replaceLogs, saveLog } from './storage';
import type { WeatherLog, WeatherSnapshot } from './types';
import { getCurrentWeather } from './weatherProvider';

type Tab = 'today' | 'log' | 'memories' | 'data';

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'log', label: 'Log', icon: '✍️' },
  { id: 'memories', label: 'Memories', icon: '🧥' },
  { id: 'data', label: 'Data', icon: '🗂️' },
];

const feelingChips = ['Cozy', 'Warm', 'Chilly', 'Damp', 'Perfect', 'Windblown'];
const outfitChips = ['Light jacket', 'Sweater', 'Rain shell', 'Hat', 'Comfy shoes', 'Layers'];
const wishChips = ['Umbrella', 'Warmer layer', 'Lighter socks', 'Gloves', 'Sunglasses', 'Water bottle'];

const emptyForm = {
  outfit: '',
  feeling: '',
  comfortLevel: '3',
  wishedFor: '',
  notes: '',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getTempClass(temp: number): string {
  if (temp <= 32) return 'text-[color:var(--temp-freezing)]';
  if (temp <= 45) return 'text-[color:var(--temp-cold)]';
  if (temp <= 60) return 'text-[color:var(--temp-cool)]';
  if (temp <= 72) return 'text-[color:var(--temp-mild)]';
  if (temp <= 82) return 'text-[color:var(--temp-warm)]';
  if (temp <= 92) return 'text-[color:var(--temp-hot)]';
  return 'text-[color:var(--temp-very-hot)]';
}

function appendChip(current: string, chip: string): string {
  if (!current.trim()) return chip;
  if (current.toLowerCase().includes(chip.toLowerCase())) return current;
  return `${current}, ${chip}`;
}

function WeatherCard({ weather, compact = false }: { weather: WeatherSnapshot | null; compact?: boolean }) {
  if (!weather) {
    return (
      <section className="card animate-pulse p-5">
        <p className="eyebrow text-[color:var(--primary)]">Current weather</p>
        <div className="mt-5 h-20 rounded-[2rem] bg-[color:var(--surface-muted)]" />
        <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">Loading today’s weather snapshot…</p>
      </section>
    );
  }

  return (
    <section className={`card overflow-hidden p-5 ${compact ? '' : 'shadow-warm'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[color:var(--primary)]">Current weather</p>
          <div className="mt-3 flex items-end gap-3">
            <h2 className={`text-6xl font-black leading-none tracking-[-0.06em] ${getTempClass(weather.temperatureF)}`}>
              {weather.temperatureF}°
            </h2>
            <p className="pb-2 text-lg font-bold text-[color:var(--muted-foreground)]">F</p>
          </div>
          <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">Feels like {weather.feelsLikeF}°F</p>
        </div>
        <span className="chip bg-[color:var(--accent-soft)] text-[color:var(--foreground)] capitalize shadow-sm">
          {weather.condition}
        </span>
      </div>

      <p className="mt-5 text-xl font-bold leading-snug text-[color:var(--foreground)]">{weather.summary}</p>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{weather.locationName}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="metric-card">
          <dt>Wind</dt>
          <dd>{weather.windMph} mph</dd>
        </div>
        <div className="metric-card">
          <dt>Humidity</dt>
          <dd>{weather.humidity}%</dd>
        </div>
        <div className="metric-card">
          <dt>Feels</dt>
          <dd>{weather.feelsLikeF}°</dd>
        </div>
        <div className="metric-card">
          <dt>Snapshot</dt>
          <dd className="text-sm">Saved</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">
        Mock provider snapshot captured {formatDate(weather.capturedAt)}.
      </p>
    </section>
  );
}

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-[color:var(--primary)]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">{title}</h2>
      <p className="mt-2 text-base leading-7 text-[color:var(--muted-foreground)]">{children}</p>
    </div>
  );
}

function ChipRow({ chips, onPick }: { chips: string[]; onPick: (chip: string) => void }) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Quick add suggestions">
      {chips.map((chip) => (
        <button className="chip min-h-11 shrink-0 border border-[color:var(--border)] bg-white" key={chip} type="button" onClick={() => onPick(chip)}>
          {chip}
        </button>
      ))}
    </div>
  );
}

function MemoryCard({ log, rank }: { log: WeatherLog; rank?: number }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          {rank ? <p className="eyebrow text-[color:var(--accent)]">Similar day #{rank}</p> : null}
          <h3 className="text-2xl font-black leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
            “{log.feeling}”
          </h3>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{formatDate(log.createdAt)}</p>
        </div>
        <span className={`rounded-2xl bg-[color:var(--surface-muted)] px-3 py-2 text-lg font-black ${getTempClass(log.weather.temperatureF)}`}>
          {log.weather.temperatureF}°
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="chip bg-[color:var(--primary-soft)] capitalize text-[color:var(--foreground)]">{log.weather.condition}</span>
        <span className="chip bg-[color:var(--accent-soft)] text-[color:var(--foreground)]">Comfort {log.comfortLevel}/5</span>
      </div>

      <p className="mt-4 text-base font-semibold leading-7 text-[color:var(--foreground)]">{log.weather.summary}</p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
        <p><strong className="text-[color:var(--foreground)]">Wore:</strong> {log.outfit}</p>
        {log.wishedFor ? <p><strong className="text-[color:var(--foreground)]">Next time:</strong> {log.wishedFor}</p> : null}
        {log.notes ? <p><strong className="text-[color:var(--foreground)]">Note:</strong> {log.notes}</p> : null}
        <p><strong className="text-[color:var(--foreground)]">Place:</strong> {log.weather.locationName}</p>
      </div>
    </article>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const recommendation = useMemo(() => getRecommendation(logs), [logs]);

  useEffect(() => {
    getCurrentWeather().then(setWeather);
    getLogs().then(setLogs).catch(() => setStatus('Could not read local logs from this browser.'));
  }, []);

  async function refreshLogs() {
    setLogs(await getLogs());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!weather) return;

    const log: WeatherLog = {
      id: createLogId(),
      createdAt: new Date().toISOString(),
      weather,
      outfit: form.outfit,
      feeling: form.feeling,
      comfortLevel: Number(form.comfortLevel) as WeatherLog['comfortLevel'],
      wishedFor: form.wishedFor,
      notes: form.notes,
    };

    await saveLog(log);
    setForm(emptyForm);
    setStatus('Saved today’s weather memory on this device.');
    await refreshLogs();
    setActiveTab('memories');
  }

  function downloadExport() {
    const exportFile = buildExport(logs);
    const blob = new Blob([JSON.stringify(exportFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mwenweather-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    const nextLogs = parseExport(await file.text());
    await replaceLogs(nextLogs);
    await refreshLogs();
    setStatus(`Imported ${nextLogs.length} log${nextLogs.length === 1 ? '' : 's'} into this browser.`);
  }

  const recentLogs = logs.slice(0, 3);

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,_rgba(219,234,254,0.95),_rgba(254,243,199,0.55)_42%,_rgba(255,253,248,0)_74%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-5 sm:max-w-lg">
        <header className="mb-6 rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-soft backdrop-blur">
          <p className="eyebrow text-[color:var(--primary)]">MwenWeather</p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.05em] text-[color:var(--foreground)]">
            I remember how this weather felt on you.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
            A local-first weather memory journal for outfits, feelings, and next-time notes.
          </p>
        </header>

        {status ? (
          <p className="mb-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900" role="status">
            {status}
          </p>
        ) : null}

        <main className="flex-1 space-y-5">
          {activeTab === 'today' && (
            <section className="space-y-5">
              <WeatherCard weather={weather} />
              <button className="primary-button" onClick={() => setActiveTab('log')} type="button">
                Log what today feels like
              </button>

              <section className="card p-5">
                <SectionIntro eyebrow="Weather memory" title={logs.length > 0 ? recommendation.title : 'Teach MwenWeather your patterns'}>
                  {logs.length > 0
                    ? recommendation.detail
                    : 'After a few logs, this space becomes a personal reminder of what helped last time—not generic clothing advice.'}
                </SectionIntro>

                {recommendation.evidence.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {recommendation.evidence.map((log, index) => (
                      <div className="rounded-[1.5rem] bg-[color:var(--surface-muted)] p-4" key={log.id}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-black text-[color:var(--foreground)]">Similar memory #{index + 1}</p>
                          <span className="chip bg-white">{log.comfortLevel}/5 comfort</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                          {log.weather.temperatureF}°F and {log.weather.condition}: you felt “{log.feeling}” and wore {log.outfit}.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5 text-center">
                    <p className="text-3xl" aria-hidden="true">🧣</p>
                    <p className="mt-2 font-bold">No memories yet.</p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                      Save today’s outfit and feeling so future you has something kind and useful to compare against.
                    </p>
                  </div>
                )}
              </section>
            </section>
          )}

          {activeTab === 'log' && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <SectionIntro eyebrow="New memory" title="What did this weather feel like?">
                Capture just enough detail to help yourself later. Short phrases are perfect.
              </SectionIntro>

              <WeatherCard compact weather={weather} />

              <section className="card space-y-5 p-5">
                <label className="field-label">
                  How I felt
                  <input
                    className="text-field"
                    value={form.feeling}
                    onChange={(event) => setForm({ ...form, feeling: event.target.value })}
                    placeholder="Warm, chilly, damp, perfect…"
                    required
                  />
                  <ChipRow chips={feelingChips} onPick={(chip) => setForm({ ...form, feeling: appendChip(form.feeling, chip) })} />
                </label>

                <label className="field-label">
                  What I wore
                  <textarea
                    className="text-field min-h-28 resize-y"
                    value={form.outfit}
                    onChange={(event) => setForm({ ...form, outfit: event.target.value })}
                    placeholder="Jeans, tee, soft cardigan, sneakers…"
                    required
                  />
                  <ChipRow chips={outfitChips} onPick={(chip) => setForm({ ...form, outfit: appendChip(form.outfit, chip) })} />
                </label>

                <label className="field-label">
                  Comfort level: {form.comfortLevel}/5
                  <input
                    className="mt-3 h-3 w-full accent-[color:var(--primary)]"
                    type="range"
                    min="1"
                    max="5"
                    value={form.comfortLevel}
                    onChange={(event) => setForm({ ...form, comfortLevel: event.target.value })}
                  />
                  <div className="mt-2 flex justify-between text-xs font-bold text-[color:var(--muted-foreground)]">
                    <span>Rough</span>
                    <span>Okay</span>
                    <span>Great</span>
                  </div>
                </label>

                <label className="field-label">
                  What I wish I had worn or brought
                  <input
                    className="text-field"
                    value={form.wishedFor}
                    onChange={(event) => setForm({ ...form, wishedFor: event.target.value })}
                    placeholder="Rain shell, lighter socks, gloves…"
                  />
                  <ChipRow chips={wishChips} onPick={(chip) => setForm({ ...form, wishedFor: appendChip(form.wishedFor, chip) })} />
                </label>

                <label className="field-label">
                  Notes
                  <textarea
                    className="text-field min-h-24 resize-y"
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    placeholder="Anything future me should know?"
                  />
                </label>

                <button className="primary-button" type="submit">Save this memory</button>
              </section>
            </form>
          )}

          {activeTab === 'memories' && (
            <section className="space-y-5">
              <SectionIntro eyebrow="Memories" title="Past weather, in your own words">
                Feeling first, then the weather details—because the memory is the point.
              </SectionIntro>

              <section className="card p-5">
                <SectionIntro eyebrow="Similar days" title={recommendation.title}>
                  {recommendation.detail}
                </SectionIntro>
                {recommendation.evidence.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {recommendation.evidence.map((log, index) => (
                      <MemoryCard key={log.id} log={log} rank={index + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    Save a few days and MwenWeather will humbly compare today with your real past outfits and feelings.
                  </div>
                )}
              </section>

              {logs.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="text-4xl" aria-hidden="true">☕</p>
                  <h3 className="mt-3 text-xl font-black">No memories saved yet</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    Your first log will show up here as a personal weather memory card.
                  </p>
                  <button className="secondary-button mt-5" onClick={() => setActiveTab('log')} type="button">Write the first one</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <MemoryCard key={log.id} log={log} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'data' && (
            <section className="space-y-5">
              <SectionIntro eyebrow="Data" title="Keep your memories safe">
                Logs stay in this browser’s IndexedDB. Export a JSON backup before changing devices or clearing browser data.
              </SectionIntro>

              <section className="card space-y-4 p-5">
                <div className="rounded-[1.5rem] bg-[color:var(--primary-soft)] p-4">
                  <h3 className="text-xl font-black">Export your memories</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    Download a readable backup file with every saved weather snapshot and note.
                  </p>
                </div>
                <button className="primary-button" onClick={downloadExport} type="button">Export JSON backup</button>
              </section>

              <section className="card space-y-4 border-red-200 p-5">
                <div>
                  <h3 className="text-xl font-black text-[color:var(--danger)]">Import a backup</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    Import replaces local logs with the selected backup file. Export first if you want to keep what is already here.
                  </p>
                </div>
                <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 px-4 py-3 text-center font-black text-red-700">
                  Choose backup file
                  <input className="sr-only" type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])} />
                </label>
              </section>
            </section>
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[color:var(--border)] bg-white/90 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-16px_40px_rgba(17,24,39,0.08)] backdrop-blur" aria-label="Primary navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                aria-current={active ? 'page' : undefined}
                className={`min-h-16 rounded-3xl px-2 py-2 text-xs font-black transition ${
                  active
                    ? 'bg-[color:var(--primary)] text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]'
                    : 'bg-[color:var(--surface-muted)] text-[color:var(--muted-foreground)]'
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className="block text-lg" aria-hidden="true">{tab.icon}</span>
                <span className="mt-1 block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
