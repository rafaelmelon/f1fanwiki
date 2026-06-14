import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPinnedDrivers, FAVORITES_EVENT, STORAGE_KEY } from "../lib/favorites";

const links = [
  { to: "/", label: "Home" },
  { to: "/race", label: "Race Weekend" },
  { to: "/seasons", label: "Seasons" },
  { to: "/drivers", label: "Drivers" },
  { to: "/greatest", label: "Greatest" },
  { to: "/circuits", label: "Circuits" },
  { to: "/compare", label: "Compare" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [pinnedCount, setPinnedCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setPinnedCount(getPinnedDrivers().length);
    update();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) update();
    };
    window.addEventListener("storage", handleStorage); // cross-tab
    window.addEventListener(FAVORITES_EVENT, update); // same-tab
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(FAVORITES_EVENT, update);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const renderLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      key={to}
      to={to}
      className={`text-sm font-medium transition-colors hover:text-white ${
        pathname === to ? "text-white" : "text-f1-text-muted"
      }`}
    >
      {label}
      {to === "/compare" && pinnedCount > 0 && (
        <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-f1-red px-1 text-[10px] font-bold text-white">
          {pinnedCount}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-f1-border bg-f1-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight">
          <span className="text-f1-red">F1</span> Wiki
        </Link>

        <div className="hidden md:flex gap-6">
          {links.map(renderLink)}
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1 p-1"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-f1-text transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-f1-text transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-f1-text transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-f1-border bg-f1-bg px-4 py-3 flex flex-col gap-3">
          {links.map(renderLink)}
        </div>
      )}
    </nav>
  );
}
