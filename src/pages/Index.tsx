import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const MOCK_DEALS = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Headphones",
    image: "🎧",
    category: "Electronics",
    currentPrice: 249,
    originalPrice: 399,
    targetPrice: 230,
    stores: [
      { name: "Amazon", price: 249, logo: "🛒" },
      { name: "Best Buy", price: 279, logo: "💙" },
      { name: "Walmart", price: 289, logo: "⭐" },
    ],
    priceHistory: [399, 379, 349, 319, 289, 269, 249],
    alert: true,
    discount: 38,
    lastDrop: "2h ago",
  },
  {
    id: 2,
    name: 'MacBook Air M3 13"',
    image: "💻",
    category: "Laptops",
    currentPrice: 1099,
    originalPrice: 1299,
    targetPrice: 1000,
    stores: [
      { name: "Apple", price: 1099, logo: "🍎" },
      { name: "Amazon", price: 1089, logo: "🛒" },
      { name: "B&H", price: 1079, logo: "📷" },
    ],
    priceHistory: [1299, 1249, 1199, 1149, 1099],
    alert: false,
    discount: 15,
    lastDrop: "1d ago",
  },
  {
    id: 3,
    name: "Nike Air Max 270",
    image: "👟",
    category: "Fashion",
    currentPrice: 89,
    originalPrice: 150,
    targetPrice: 75,
    stores: [
      { name: "Nike", price: 150, logo: "✔️" },
      { name: "Amazon", price: 89, logo: "🛒" },
      { name: "Foot Locker", price: 110, logo: "👟" },
    ],
    priceHistory: [150, 140, 120, 100, 89],
    alert: true,
    discount: 41,
    lastDrop: "5h ago",
  },
  {
    id: 4,
    name: "Dyson V15 Vacuum",
    image: "🌀",
    category: "Home",
    currentPrice: 649,
    originalPrice: 749,
    targetPrice: 600,
    stores: [
      { name: "Dyson", price: 749, logo: "🔵" },
      { name: "Amazon", price: 649, logo: "🛒" },
      { name: "Target", price: 699, logo: "🎯" },
    ],
    priceHistory: [749, 729, 699, 679, 649],
    alert: false,
    discount: 13,
    lastDrop: "3d ago",
  },
  {
    id: 5,
    name: "PS5 DualSense Controller",
    image: "🎮",
    category: "Gaming",
    currentPrice: 59,
    originalPrice: 69,
    targetPrice: 50,
    stores: [
      { name: "PlayStation", price: 69, logo: "🎮" },
      { name: "Amazon", price: 59, logo: "🛒" },
      { name: "GameStop", price: 64, logo: "🕹️" },
    ],
    priceHistory: [69, 66, 64, 61, 59],
    alert: false,
    discount: 14,
    lastDrop: "12h ago",
  },
  {
    id: 6,
    name: "Kindle Paperwhite 11th Gen",
    image: "📖",
    category: "Electronics",
    currentPrice: 99,
    originalPrice: 139,
    targetPrice: 89,
    stores: [
      { name: "Amazon", price: 99, logo: "🛒" },
      { name: "Best Buy", price: 119, logo: "💙" },
      { name: "Target", price: 109, logo: "🎯" },
    ],
    priceHistory: [139, 129, 119, 109, 99],
    alert: true,
    discount: 29,
    lastDrop: "6h ago",
  },
];

const CATEGORIES = ["All", "Electronics", "Laptops", "Fashion", "Home", "Gaming"];

const NOTIFICATIONS = [
  { id: 1, text: "Sony WH-1000XM5 dropped to $249!", icon: "🎧" },
  { id: 2, text: "Nike Air Max hit your target price!", icon: "👟" },
  { id: 3, text: "Kindle Paperwhite: New all-time low!", icon: "📖" },
];

function MiniChart({ history }: { history: number[] }) {
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const isDown = history[history.length - 1] < history[0];
  const color = isDown ? "#10b981" : "#f97316";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={parseFloat(points[points.length - 1].split(",")[0])}
        cy={parseFloat(points[points.length - 1].split(",")[1])}
        r="3"
        fill={color}
      />
    </svg>
  );
}

function NotificationBanner() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % NOTIFICATIONS.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const n = NOTIFICATIONS[current];
  return (
    <div
      className="fixed top-4 right-4 z-50 transition-all duration-500"
      style={{
        transform: visible ? "translateX(0)" : "translateX(130%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-3 bg-card border border-primary/30 rounded-2xl px-4 py-3 shadow-2xl max-w-xs"
        style={{ boxShadow: "0 0 40px rgba(255,120,20,0.25), 0 8px 32px rgba(0,0,0,0.4)" }}>
        <div className="text-2xl">{n.icon}</div>
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide font-syne">Price Alert</p>
          <p className="text-sm text-foreground font-dm">{n.text}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse ml-1 flex-shrink-0" />
      </div>
    </div>
  );
}

function DealCard({ deal, index }: { deal: typeof MOCK_DEALS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [alertSet, setAlertSet] = useState(deal.alert);
  const savings = deal.originalPrice - deal.currentPrice;
  const progress = ((deal.currentPrice - deal.targetPrice) / (deal.originalPrice - deal.targetPrice)) * 100;
  const progressFill = Math.min(100, Math.max(5, 100 - progress));

  return (
    <div
      className="deal-card rounded-2xl p-5 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 0.06}s`, opacity: 0 }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{deal.image}</div>
          <div>
            <span className="text-xs text-muted-foreground font-dm uppercase tracking-wider">{deal.category}</span>
            <h3 className="font-syne font-semibold text-foreground text-sm leading-tight mt-0.5 max-w-[160px]">{deal.name}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-xs font-bold px-2 py-1 rounded-lg text-white"
            style={{
              background:
                deal.discount >= 35
                  ? "linear-gradient(135deg, #ff4444, #ff6b35)"
                  : deal.discount >= 20
                  ? "linear-gradient(135deg, #f97316, #fb923c)"
                  : "linear-gradient(135deg, #10b981, #34d399)",
            }}
          >
            -{deal.discount}%
          </span>
          <span className="text-xs text-muted-foreground">{deal.lastDrop}</span>
        </div>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-syne font-bold text-foreground">${deal.currentPrice}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
          </div>
          <span className="text-xs font-medium" style={{ color: "#10b981" }}>Save ${savings}</span>
        </div>
        <MiniChart history={deal.priceHistory} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Target: ${deal.targetPrice}</span>
          <span className="text-foreground font-medium">{Math.max(0, Math.round(progressFill))}% to goal</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressFill}%`,
              background:
                progressFill >= 80
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : progressFill >= 50
                  ? "linear-gradient(90deg, #f97316, #fb923c)"
                  : "linear-gradient(90deg, #ff4444, #f97316)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {deal.stores.slice(0, 3).map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1"
              title={`${s.name}: $${s.price}`}
            >
              <span className="text-xs">{s.logo}</span>
              <span className="text-xs font-medium text-foreground">${s.price}</span>
            </div>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAlertSet((a) => !a);
          }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            alertSet
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary text-muted-foreground border border-border hover:border-primary/30"
          }`}
        >
          <Icon name={alertSet ? "BellRing" : "Bell"} size={12} />
          {alertSet ? "Watching" : "Alert"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-syne">Price Comparison</p>
          <div className="space-y-2">
            {deal.stores.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{s.logo}</span>
                  <span className="text-sm text-foreground">{s.name}</span>
                  {i === 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>Best</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${i === 0 ? "" : "text-foreground"}`} style={i === 0 ? { color: "#10b981" } : {}}>
                    ${s.price}
                  </span>
                  {i > 0 && (
                    <span className="text-xs text-muted-foreground">+${s.price - deal.stores[0].price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-4 w-full py-2.5 rounded-xl font-syne font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(0,100%,60%))" }}
            onClick={(e) => e.stopPropagation()}
          >
            View Best Deal →
          </button>
        </div>
      )}
    </div>
  );
}

function StatsBar() {
  const stats = [
    { label: "Deals Tracked", value: "12,847", icon: "TrendingDown", color: "#10b981" },
    { label: "Avg Savings", value: "$94", icon: "DollarSign", color: "hsl(25,100%,55%)" },
    { label: "Active Alerts", value: "3,201", icon: "Bell", color: "#facc15" },
    { label: "Price Drops Today", value: "847", icon: "Zap", color: "#60a5fa" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-2xl p-4 animate-fade-in"
          style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon name={s.icon as "Zap"} size={14} style={{ color: s.color }} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className="text-2xl font-syne font-bold" style={{ color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function Index() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("discount");

  const filtered = MOCK_DEALS.filter((d) => {
    const matchCat = category === "All" || d.category === category;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sort === "discount") return b.discount - a.discount;
    if (sort === "price-asc") return a.currentPrice - b.currentPrice;
    if (sort === "price-desc") return b.currentPrice - a.currentPrice;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <NotificationBanner />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(25,100%,55%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -left-20 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(0,100%,58%))" }}
              >
                <Icon name="Zap" size={18} className="text-white" />
              </div>
              <span className="font-syne font-extrabold text-2xl text-foreground tracking-tight">DealPulse</span>
            </div>
            <p className="text-muted-foreground text-sm font-dm">Track prices. Get notified. Never overpay.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-primary absolute -top-0.5 -right-0.5 animate-pulse" />
              <button className="bg-secondary border border-border rounded-xl p-2.5 hover:border-primary/40 transition-colors">
                <Icon name="Bell" size={18} className="text-foreground" />
              </button>
            </div>
            <button
              className="flex items-center gap-2 text-sm font-syne font-semibold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(15,100%,50%))" }}
            >
              <Icon name="Plus" size={16} />
              Track Item
            </button>
          </div>
        </div>

        <StatsBar />

        {/* Search + Filters */}
        <div
          className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors font-dm"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-dm"
          >
            <option value="discount">Best Discount</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Category pills */}
        <div
          className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium font-syne transition-all ${
                category === cat
                  ? "text-white shadow-lg"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-primary/30"
              }`}
              style={
                category === cat
                  ? { background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(15,100%,50%))" }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Alert strip */}
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-8 animate-fade-in"
          style={{
            animationDelay: "0.3s",
            opacity: 0,
            background: "rgba(255,120,20,0.08)",
            border: "1px solid rgba(255,120,20,0.2)",
          }}
        >
          <Icon name="BellRing" size={18} style={{ color: "hsl(25,100%,55%)" }} className="flex-shrink-0" />
          <p className="text-sm text-foreground font-dm">
            <span className="font-semibold" style={{ color: "hsl(25,100%,55%)" }}>3 items</span>
            {" "}on your watchlist are close to their target price.
          </p>
          <button
            className="ml-auto text-xs font-syne font-semibold whitespace-nowrap hover:underline"
            style={{ color: "hsl(25,100%,55%)" }}
          >
            View All →
          </button>
        </div>

        {/* Deal grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-syne font-semibold text-foreground text-lg">No deals found</p>
            <p className="text-muted-foreground text-sm mt-1">Try a different search or category</p>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-dm">
          <span>© 2025 DealPulse — Prices updated every 15 minutes</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
