import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm transition ${isActive ? "bg-white text-ink-950" : "text-white/70 hover:bg-white/10 hover:text-white"}`;

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-ember-500 text-ink-950 font-bold shadow-glow">
              P
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide">PhinuxTV</div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                Stream, save, replay
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              Discover
            </NavLink>
            <NavLink to="/favorites" className={navLinkClass}>
              Favorites
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              History
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Watching as
              </div>
              <div className="text-sm font-medium text-white/90">
                {user?.name || "Guest"}
              </div>
            </div>
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={isMobileMenuOpen}
              >
                Menu
              </button>
              {isMobileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/40">
                    Navigate
                  </div>
                  <div className="p-2">
                    <NavLink
                      to="/"
                      end
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-xl px-3 py-2 text-sm transition ${isActive ? "bg-white text-ink-950" : "text-white/75 hover:bg-white/10 hover:text-white"}`
                      }
                    >
                      Discover
                    </NavLink>
                    <NavLink
                      to="/favorites"
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-xl px-3 py-2 text-sm transition ${isActive ? "bg-white text-ink-950" : "text-white/75 hover:bg-white/10 hover:text-white"}`
                      }
                    >
                      Favorites
                    </NavLink>
                    <NavLink
                      to="/history"
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-xl px-3 py-2 text-sm transition ${isActive ? "bg-white text-ink-950" : "text-white/75 hover:bg-white/10 hover:text-white"}`
                      }
                    >
                      History
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                      className="mt-2 block w-full rounded-xl px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 md:inline-flex"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <p className="mt-2 text-center text-xl text-ember-500/50">
          This website or application uses TMDB and the TMDB APIs but is not
          endorsed, certified, or otherwise approved by TMDB.
        </p>
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-white/40">
            &copy; {new Date().getFullYear()} PhinuxTV. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
