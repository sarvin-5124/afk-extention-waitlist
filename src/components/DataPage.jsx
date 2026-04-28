import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CACHE_KEY = "afk_stats_cache";
const CACHE_TTL = 5 * 60 * 1000;

const cache = {
  read() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, cachedAt } = JSON.parse(raw);
      if (Date.now() - cachedAt > CACHE_TTL) return null;
      return { data, cachedAt };
    } catch {
      return null;
    }
  },
  write(data) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, cachedAt: Date.now() }),
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

export default function DataPage() {
  const [stats, setStats] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchStats() {
    setLoading(true);
    setError("");
    const { data, error: rpcError } = await loadStats();
    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setStats(data);
      setCachedAt(Date.now());
      cache.write(data);
    }
  }

  useEffect(() => {
    const cached = cache.read();
    if (cached) {
      setStats(cached.data);
      setCachedAt(cached.cachedAt);
    } else {
      fetchStats();
    }
  }, []);

  // Tick every 30s to keep the age label fresh; auto-refresh when TTL expires
  useEffect(() => {
    const id = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (cachedAt && tick - cachedAt > CACHE_TTL) fetchStats();
    }, 30_000);
    return () => clearInterval(id);
  }, [cachedAt]);

  function handleRefresh() {
    cache.clear();
    fetchStats();
  }

  const age = cachedAt ? Math.floor((now - cachedAt) / 1000 / 60) : null;

  return (
    <div className="page">
      <div className="blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="card">
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
            </>
          )}
        </div>
      </div>
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
