import { useState } from "react";
import { Search, MapPin, Activity, User } from "lucide-react";
import { LoadSpinner2, LogoF } from "../assets";

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "", onClick }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

const MOCK_HOSPITALS = [
  { id: 1, name: "City General Hospital", resource: "MRI", distance: "2.1km" },
  { id: 2, name: "LifeCare Clinic", resource: "MRI", distance: "4.5km" },
  { id: 3, name: "Hope Medical", resource: "ICU", distance: "3.2km" },
];

export default function PublicSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQuick, setActiveQuick] = useState("");

  const handleSearch = (value) => {
    if (!value) return;

    setQuery(value);
    setActiveQuick(value.toLowerCase());
    setLoading(true);

    setTimeout(() => {
      const filtered = MOCK_HOSPITALS.filter((h) =>
        h.resource.toLowerCase().includes(value.toLowerCase()),
      );
      setResults(filtered);
      setLoading(false);
    }, 800);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-slate-950 text-white  relative">
      <nav className="bg-white p-3">
        <img src={LogoF} alt="" className="w-44" />
      </nav>
      <div className="p-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="flex gap-3 mb-8 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleEnter}
              placeholder="Search MRI, ICU, Anti-venom..."
              className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 outline-none"
            />
            <Button onClick={() => handleSearch(query)}>
              <Search />
            </Button>
          </div>

          {/* Quick Cards */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {["MRI", "ICU", "Anti-Venom"].map((item) => {
              const isActive = activeQuick === item.toLowerCase();

              return (
                <Card
                  key={item}
                  className={`cursor-pointer transition ${
                    isActive
                      ? "bg-emerald-500/20 border-emerald-400"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => {
                    handleSearch(item);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="text-emerald-400" />
                    <span className="font-semibold">{item}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Map + Results */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-[400px] rounded-2xl bg-linear-to-br from-slate-900 to-emerald-900 border border-white/10 relative overflow-hidden">
              {/* User */}
              <div className="absolute top-[50%] left-[40%] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center">
                  <User size={16} className="text-black" />
                </div>
                <span className="text-xs mt-1 text-emerald-300">You</span>
              </div>

              {/* Hospitals */}
              {results.map((r) => (
                <div
                  key={r.id}
                  className="absolute flex items-center gap-2"
                  style={{
                    top: `${20 + r.id * 20}px`,
                    left: `${50 + r.id * 30}px`,
                  }}
                >
                  <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                  <span className="text-xs text-white/80">{r.name}</span>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-4">
              {results.length === 0 && !loading ? (
                <Card>No results found</Card>
              ) : (
                results.map((r) => (
                  <Card
                    key={r.id}
                    className="cursor-pointer hover:bg-white/10"
                    onClick={() => setSelected(r)}
                  >
                    <h3 className="font-bold">{r.name}</h3>
                    <p className="text-sm text-emerald-300">{r.resource}</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 mt-2">
                      <MapPin size={14} /> {r.distance}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              {/* <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div> */}
              <img src={LoadSpinner2} alt="loading..." />
              <p className="text-emerald-300 text-lg">Searching...</p>
            </div>
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-emerald-950 p-6 rounded-2xl border border-white/10 w-[300px]">
              <h2 className="text-xl font-bold mb-2">{selected.name}</h2>
              <p className="text-emerald-300">{selected.resource}</p>
              <p className="text-sm mt-2">Distance: {selected.distance}</p>
              <Button className="mt-4 w-full" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
