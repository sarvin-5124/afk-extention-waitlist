import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CACHE_KEY = "afk_stats_cache";
const CACHE_TTL = 5 * 60 * 1000;
const ENTRIES_LIMIT = 100;

const cache = {
  read() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { stats, entries, cachedAt } = JSON.parse(raw);
      if (Date.now() - cachedAt > CACHE_TTL) return null;
      return { stats, entries, cachedAt };
    } catch {
      return null;
    }
  },
  write(stats, entries) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ stats, entries, cachedAt: Date.now() }),
      );
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  },
};

async function loadStats() {
  return supabase.rpc("get_waitlist_stats");
}

async function loadEntries() {
  return supabase
    .from("waitlist")
    .select("id, name, email, phone, country_code, country, created_at")
    .order("created_at", { ascending: false })
    .limit(ENTRIES_LIMIT);
}

export default function DataPage() {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchAll() {
    setLoading(true);
    setError("");
    const [statsRes, entriesRes] = await Promise.all([
      loadStats(),
      loadEntries(),
    ]);
    setLoading(false);

    if (statsRes.error) {
      setError(statsRes.error.message);
      return;
    }
    if (entriesRes.error) {
      setError(entriesRes.error.message);
      return;
    }

    const fetchedAt = Date.now();
    setStats(statsRes.data);
    setEntries(entriesRes.data ?? []);
    setCachedAt(fetchedAt);
    setNow(fetchedAt);
    cache.write(statsRes.data, entriesRes.data ?? []);
  }

  useEffect(() => {
    const cached = cache.read();
    if (cached) {
      setStats(cached.stats);
      setEntries(cached.entries);
      setCachedAt(cached.cachedAt);
    } else {
      fetchAll();
    }
  }, []);

  // Tick every 30s to keep the age label fresh; auto-refresh when TTL expires
  useEffect(() => {
    const id = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (cachedAt && tick - cachedAt > CACHE_TTL) fetchAll();
    }, 30_000);
    return () => clearInterval(id);
  }, [cachedAt]);

  function handleRefresh() {
    cache.clear();
    fetchAll();
  }

  const age = cachedAt ? Math.floor((now - cachedAt) / 1000 / 60) : null;

  return (
    <div className="page">
      <div className="blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="card card--wide">
        <div className="card-inner">
          <div className="data-header">
            <div>
              <h1 className="data-title">AFK Waitlist</h1>
              <p className="data-age">
                {age !== null
                  ? `Updated ${age === 0 ? "just now" : `${age} min ago`}`
                  : "Live stats"}
              </p>
            </div>
            <button
              className="btn-refresh"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {error && <p className="submit-error">{error}</p>}

          {!stats && !error && <p className="data-loading">Loading…</p>}

          {stats && (
            <>
              <div className="stats-grid">
                <Stat label="Total signups" value={stats.total} />
                <Stat label="Joined today" value={stats.today} />
              </div>

              <div className="data-section">
                <p className="section-label">Latest signup</p>
                <p className="section-value">
                  {stats.latest ? new Date(stats.latest).toLocaleString() : "—"}
                </p>
              </div>

              {stats.countries?.length > 0 && (
                <div className="data-section">
                  <p className="section-label">Top countries</p>
                  {stats.countries.map((c) => (
                    <div key={c.country} className="country-row">
                      <span className="country-name">{c.country}</span>
                      <span className="country-count">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="data-section">
                <p className="section-label">
                  Entries
                  {entries && (
                    <span className="entries-meta">
                      {" "}
                      — showing {entries.length}
                      {stats.total > entries.length ? ` of ${stats.total}` : ""}
                    </span>
                  )}
                </p>
                <EntriesTable entries={entries} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EntriesTable({ entries }) {
  if (!entries) return <p className="data-loading">Loading entries…</p>;
  if (entries.length === 0)
    return <p className="entries-empty">No signups yet.</p>;

  return (
    <div className="entries-scroll">
      <table className="entries-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Country</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td className="cell-email">{e.email}</td>
              <td className="cell-phone">
                {e.country_code} {e.phone}
              </td>
              <td>{e.country}</td>
              <td className="cell-date">
                {new Date(e.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? "—"}</p>
    </div>
  );
}
