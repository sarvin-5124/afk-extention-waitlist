import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CACHE_KEY = "afk_stats_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
        background: "#0d0d0d",
        color: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem",
          background: "#1a1a1a",
          borderRadius: 16,
          border: "1px solid #2a2a2a",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 0.25rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#888",
              }}
            >
              AFK Waitlist
            </h1>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#444" }}>
              {age !== null
                ? `Updated ${age === 0 ? "just now" : `${age} min ago`}`
                : "Live stats"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              background: "none",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              padding: "0.35rem 0.75rem",
              color: loading ? "#444" : "#888",
              fontSize: "0.75rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        {!stats && !error && (
          <p style={{ color: "#555", fontSize: "0.9rem" }}>Loading…</p>
        )}

        {stats && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <Stat label="Total signups" value={stats.total} />
              <Stat label="Joined today" value={stats.today} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Latest signup
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#aaa" }}>
                {stats.latest ? new Date(stats.latest).toLocaleString() : "—"}
              </p>
            </div>

            {stats.countries?.length > 0 && (
              <div>
                <p
                  style={{
                    margin: "0 0 0.75rem",
                    fontSize: "0.75rem",
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Top countries
                </p>
                {stats.countries.map((c) => (
                  <div
                    key={c.country}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#ccc" }}>
                      {c.country}
                    </span>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#f5f5f5",
                      }}
                    >
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: 10,
        padding: "1rem",
        border: "1px solid #2a2a2a",
      }}
    >
      <p
        style={{
          margin: "0 0 0.25rem",
          fontSize: "0.75rem",
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{ margin: 0, fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
