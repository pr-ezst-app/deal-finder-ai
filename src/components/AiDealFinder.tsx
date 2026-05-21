import { useState } from "react";
import Icon from "@/components/ui/icon";

const getGroqKey = () =>
  import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem("groq_api_key") || "";

const SYSTEM_PROMPT = `You are an expert shopping assistant and deal finder.
When given a product query and optional budget, analyze the market and return the best value options.

For SPECIFIC products (e.g. "Sony WH-1000XM5"): return 3 store options showing where to buy cheapest.
For GENERAL categories (e.g. "gaming laptop", "wireless headphones"):
  - Recommend 3 specific product models that best fit the budget and use case
  - For each: full model name, why it is the best value, key specs, estimated price, stores

Always respond with valid JSON only. No markdown fences, no extra text — raw JSON only.

Required JSON structure:
{
  "query_type": "general",
  "summary": "1-2 sentence expert summary of the best picks for this budget/query",
  "results": [
    {
      "rank": 1,
      "name": "Full product model name",
      "emoji": "single relevant emoji",
      "why": "One sentence: why best value for the money",
      "specs": ["Spec 1", "Spec 2", "Spec 3", "Spec 4"],
      "price_range": "$XXX - $XXX",
      "best_price": 299,
      "value_score": 92,
      "stores": [
        { "name": "Amazon", "price": 299, "url": "https://www.amazon.com/s?k=Product+Name" },
        { "name": "Best Buy", "price": 319, "url": "https://www.bestbuy.com/site/searchpage.jsp?st=Product+Name" },
        { "name": "Walmart", "price": 309, "url": "https://www.walmart.com/search?q=Product+Name" }
      ]
    }
  ]
}

Rules:
- value_score is 0-100 based on price-to-performance for the stated budget
- Store URLs: use real search URLs, spaces as + in k= or st= or q= params
- Always return exactly 3 results
- query_type: "specific" or "general"`;

interface Store {
  name: string;
  price: number;
  url: string;
}

interface DealResult {
  rank: number;
  name: string;
  emoji: string;
  why: string;
  specs: string[];
  price_range: string;
  best_price: number;
  value_score: number;
  stores: Store[];
}

interface AIResponse {
  query_type: string;
  summary: string;
  results: DealResult[];
}

const SUGGESTIONS = [
  { label: "Gaming laptop", budget: "$800" },
  { label: "Noise-cancelling headphones", budget: "$200" },
  { label: "4K monitor", budget: "$400" },
  { label: "Mechanical keyboard", budget: "$150" },
  { label: "Wireless earbuds", budget: "$100" },
  { label: "Standing desk", budget: "$500" },
];

function ValueBar({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f97316" : "#facc15";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold font-syne" style={{ color }}>{score}</span>
    </div>
  );
}

function ResultCard({ result, index }: { result: DealResult; index: number }) {
  const [storesOpen, setStoresOpen] = useState(false);
  const rankColors = ["#f97316", "#94a3b8", "#cd7c2e"];
  const rankLabels = ["Best Pick", "Runner Up", "Budget Alt"];

  return (
    <div
      className="deal-card rounded-2xl p-5 animate-fade-in"
      style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-3xl flex-shrink-0">{result.emoji}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md font-syne"
                style={{ background: `${rankColors[index]}22`, color: rankColors[index] }}
              >
                #{result.rank} {rankLabels[index]}
              </span>
            </div>
            <h3 className="font-syne font-bold text-foreground text-sm leading-tight">{result.name}</h3>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="text-xl font-syne font-bold text-foreground">${result.best_price}</div>
          <div className="text-xs text-muted-foreground">{result.price_range}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-dm mb-3 italic">"{result.why}"</p>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span className="font-syne uppercase tracking-wider">Value Score</span>
        </div>
        <ValueBar score={result.value_score} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {result.specs.map((spec, i) => (
          <span
            key={i}
            className="text-xs px-2 py-1 rounded-lg font-dm"
            style={{ background: "rgba(255,255,255,0.05)", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
          >
            {spec}
          </span>
        ))}
      </div>

      <button
        onClick={() => setStoresOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-syne font-semibold px-3 py-2 rounded-xl transition-all"
        style={{ background: "rgba(255,120,20,0.08)", color: "hsl(25,100%,55%)", border: "1px solid rgba(255,120,20,0.2)" }}
      >
        <span>Compare Prices ({result.stores.length} stores)</span>
        <Icon name={storesOpen ? "ChevronUp" : "ChevronDown"} size={14} />
      </button>

      {storesOpen && (
        <div className="mt-3 space-y-1.5 animate-fade-in">
          {result.stores
            .slice()
            .sort((a, b) => a.price - b.price)
            .map((store, i) => (
              <a
                key={store.name}
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl px-3 py-2 transition-all hover:bg-secondary group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-dm text-foreground group-hover:underline underline-offset-2">
                    {store.name}
                  </span>
                  {i === 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>
                      Cheapest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={i === 0 ? { color: "#10b981" } : { color: "hsl(var(--foreground))" }}>
                    ${store.price}
                  </span>
                  <Icon name="ExternalLink" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
        </div>
      )}
    </div>
  );
}

export default function AiDealFinder() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState("");
  const [dots, setDots] = useState(1);
  const [keyInput, setKeyInput] = useState("");
  const [showKeySetup, setShowKeySetup] = useState(!getGroqKey());

  const saveKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem("groq_api_key", keyInput.trim());
      setShowKeySetup(false);
    }
  };

  const search = async (q = query, b = budget) => {
    if (!q.trim()) return;
    const apiKey = getGroqKey();
    if (!apiKey) { setShowKeySetup(true); return; }
    setLoading(true);
    setResult(null);
    setError("");

    const dotInterval = setInterval(() => setDots((d) => (d % 3) + 1), 500);

    try {
      const userMsg = b ? `Product query: ${q}\nBudget: ${b}` : `Product query: ${q}`;

      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg },
          ],
          temperature: 0.3,
          max_tokens: 1800,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err?.error?.message || `API error ${resp.status}`);
      }

      const data = await resp.json();
      let raw = data.choices[0].message.content.trim();
      if (raw.startsWith("```")) {
        raw = raw.split("\n").slice(1).join("\n");
        raw = raw.split("```")[0].trim();
      }
      setResult(JSON.parse(raw));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      clearInterval(dotInterval);
      setLoading(false);
    }
  };

  const handleSuggestion = (s: { label: string; budget: string }) => {
    setQuery(s.label);
    setBudget(s.budget);
    search(s.label, s.budget);
  };

  return (
    <div className="rounded-3xl border border-border overflow-hidden mb-10" style={{ background: "linear-gradient(135deg, hsl(222,40%,7%) 0%, hsl(222,45%,6%) 100%)" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Icon name="Sparkles" size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-syne font-bold text-foreground text-lg leading-tight">AI Deal Finder</h2>
            <p className="text-xs text-muted-foreground font-dm">Search any product or category — get the best picks for your budget</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs font-dm px-3 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI Powered
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key setup */}
        {showKeySetup && (
          <div className="rounded-2xl p-5 mb-5 animate-fade-in" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="KeyRound" size={16} style={{ color: "#a855f7" }} />
              <p className="text-sm font-syne font-semibold text-foreground">Enter your Groq API Key</p>
            </div>
            <p className="text-xs text-muted-foreground font-dm mb-3">
              Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">console.groq.com/keys</a> — it's free and takes 30 seconds.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors font-dm"
              />
              <button
                onClick={saveKey}
                disabled={!keyInput.trim()}
                className="px-4 py-2.5 rounded-xl font-syne font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder='e.g. "gaming laptop" or "Sony WH-1000XM5"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors font-dm"
            />
          </div>
          <div className="relative">
            <Icon name="DollarSign" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Budget (optional)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="w-full sm:w-44 bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors font-dm"
            />
          </div>
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-syne font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            {loading ? (
              <>
                <Icon name="Loader" size={16} className="animate-spin" />
                Searching{".".repeat(dots)}
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={16} />
                Find Deals
              </>
            )}
          </button>
        </div>

        {/* Quick suggestions */}
        {!result && !loading && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground font-dm mb-2">Try a quick search:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-xl font-dm transition-all hover:border-purple-500/40 hover:text-foreground"
                  style={{ background: "rgba(124,58,237,0.08)", color: "hsl(var(--muted-foreground))", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  {s.label} <span className="opacity-60">· {s.budget}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "rgba(124,58,237,0.3)" }} />
              <div className="flex-1">
                <div className="h-3 rounded-full mb-2 animate-pulse" style={{ background: "rgba(255,255,255,0.06)", width: "60%" }} />
                <div className="h-2 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.04)", width: "40%" }} />
              </div>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl p-5 border border-border animate-pulse" style={{ background: "hsl(222,40%,8%)" }}>
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "70%" }} />
                    <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)", width: "50%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                  <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)", width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mt-2 animate-fade-in" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)" }}>
            <Icon name="AlertCircle" size={16} style={{ color: "#ff4444" }} />
            <p className="text-sm text-foreground font-dm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-2 animate-fade-in">
            <div
              className="rounded-2xl px-4 py-3 mb-4"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <div className="flex items-start gap-2">
                <Icon name="Sparkles" size={14} style={{ color: "#a855f7" }} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground font-dm">{result.summary}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.results.map((r, i) => (
                <ResultCard key={r.rank} result={r} index={i} />
              ))}
            </div>
            <button
              onClick={() => { setResult(null); setQuery(""); setBudget(""); }}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground font-dm transition-colors flex items-center gap-1"
            >
              <Icon name="RotateCcw" size={12} />
              New search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}