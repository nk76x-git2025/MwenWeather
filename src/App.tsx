import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createLogId } from './logIds';
import { getRecommendation } from './recommendations';
import { buildExport, getLogs, parseExport, replaceLogs, saveLog } from './storage';
import type { WeatherLog, WeatherSnapshot } from './types';
import { getCurrentWeather } from './weatherProvider';

type Tab = 'weather' | 'log' | 'history' | 'recommend' | 'settings';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'weather', label: 'Weather' },
  { id: 'log', label: 'Log' },
  { id: 'history', label: 'History' },
  { id: 'recommend', label: 'Advice' },
  { id: 'settings', label: 'Data' },
];

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

function WeatherCard({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">Loading local weather preview…</div>;
  }

  return (
    <section className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Current weather</p>
          <h2 className="mt-2 text-4xl font-black">{weather.temperatureF}°F</h2>
          <p className="mt-1 text-slate-300">Feels like {weather.feelsLikeF}°F</p>
        </div>
        <span className="rounded-full bg-sky-400/10 px-4 py-2 text-sm font-semibold capitalize text-sky-200">
          {weather.condition}
        </span>
      </div>
      <p className="mt-5 text-lg text-slate-100">{weather.summary}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="rounded-2xl bg-slate-950/60 p-3">
          <dt>Humidity</dt>
          <dd className="text-xl font-bold text-white">{weather.humidity}%</dd>
        </div>
        <div className="rounded-2xl bg-slate-950/60 p-3">
          <dt>Wind</dt>
          <dd className="text-xl font-bold text-white">{weather.windMph} mph</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-slate-400">Mock provider snapshot captured {formatDate(weather.capturedAt)}.</p>
    </section>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('weather');
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
    setActiveTab('history');
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#164e63,_#020617_42%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-5">
        <header className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">MwenWeather</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">Weather memories that explain what to wear next.</h1>
        </header>

        {status && <p className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{status}</p>}

        <main className="flex-1 space-y-5">
          {activeTab === 'weather' && (
            <>
              <WeatherCard weather={weather} />
              <button className="min-h-12 w-full rounded-2xl bg-sky-400 px-4 py-3 font-bold text-slate-950" onClick={() => setActiveTab('log')}>
                Log what this feels like
              </button>
            </>
          )}

          {activeTab === 'log' && (
            <form className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-5" onSubmit={handleSubmit}>
              <WeatherCard weather={weather} />
              <label className="block text-sm font-semibold text-slate-200">
                What did you wear?
                <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-base" value={form.outfit} onChange={(event) => setForm({ ...form, outfit: event.target.value })} required />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                How did it feel?
                <input className="mt-2 min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-base" value={form.feeling} onChange={(event) => setForm({ ...form, feeling: event.target.value })} placeholder="Warm, chilly, damp, perfect…" required />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                Comfort level: {form.comfortLevel}/5
                <input className="mt-2 w-full accent-sky-400" type="range" min="1" max="5" value={form.comfortLevel} onChange={(event) => setForm({ ...form, comfortLevel: event.target.value })} />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                What do you wish you had worn or brought?
                <input className="mt-2 min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-base" value={form.wishedFor} onChange={(event) => setForm({ ...form, wishedFor: event.target.value })} placeholder="Rain shell, lighter socks, gloves…" />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                Notes
                <textarea className="mt-2 min-h-20 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-base" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </label>
              <button className="min-h-12 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-bold text-slate-950">Save local log</button>
            </form>
          )}

          {activeTab === 'history' && (
            <section className="space-y-3">
              <h2 className="text-2xl font-black">History</h2>
              {logs.length === 0 ? <p className="rounded-2xl bg-slate-900 p-4 text-slate-300">No logs yet. Save your first weather memory.</p> : null}
              {logs.map((log) => (
                <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4" key={log.id}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">{formatDate(log.createdAt)}</h3>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm">{log.weather.temperatureF}°F</span>
                  </div>
                  <p className="mt-2 text-slate-300">{log.weather.summary}</p>
                  <p className="mt-3"><strong>Outfit:</strong> {log.outfit}</p>
                  <p className="mt-1"><strong>Felt:</strong> {log.feeling} ({log.comfortLevel}/5)</p>
                  {log.wishedFor && <p className="mt-1 text-sky-200"><strong>Next time:</strong> {log.wishedFor}</p>}
                </article>
              ))}
            </section>
          )}

          {activeTab === 'recommend' && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Explainable advice</p>
              <h2 className="mt-3 text-2xl font-black">{recommendation.title}</h2>
              <p className="mt-3 text-slate-300">{recommendation.detail}</p>
              <div className="mt-5 space-y-3">
                {recommendation.evidence.map((log) => (
                  <div className="rounded-2xl bg-slate-950 p-3" key={log.id}>
                    <p className="font-semibold">{formatDate(log.createdAt)} · {log.comfortLevel}/5 comfort</p>
                    <p className="text-sm text-slate-300">{log.weather.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-5">
              <h2 className="text-2xl font-black">Settings & data</h2>
              <p className="text-slate-300">Logs stay in this browser’s IndexedDB. Export a JSON backup before changing devices or clearing browser data.</p>
              <button className="min-h-12 w-full rounded-2xl bg-sky-400 px-4 py-3 font-bold text-slate-950" onClick={downloadExport}>Export JSON backup</button>
              <label className="block rounded-2xl border border-dashed border-slate-600 p-4 text-center font-semibold">
                Import JSON backup
                <input className="sr-only" type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])} />
              </label>
              <p className="text-sm text-slate-400">Import replaces local logs with the selected backup file.</p>
            </section>
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {tabs.map((tab) => (
            <button className={`min-h-12 rounded-2xl px-2 text-xs font-bold ${activeTab === tab.id ? 'bg-sky-400 text-slate-950' : 'text-slate-300'}`} key={tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
