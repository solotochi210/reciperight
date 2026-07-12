import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus, LogOut, User as UserIcon, Search } from 'lucide-react';
import useScrollDirection from '../../hooks/useScrollDirection';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../ui/Toast';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
];

export default function Navbar() {
  const { direction, atTop } = useScrollDirection();
  const { user, isAuthenticated, logout } = useAuth();
  const { success } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Keep navbar visible when logged in so Profile / Log out stay reachable
  const hidden = direction === 'down' && !drawerOpen && !isAuthenticated;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setDrawerOpen(false);
    success('Logged out successfully');
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors',
        atTop ? 'border-transparent' : 'border-[var(--border)]'
      )}
      style={{
        background: 'rgba(250,249,253,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="group font-heading text-2xl font-bold tracking-tight transition-transform duration-150 hover:-translate-y-0.5"
        >
          Recipe<span className="accent-text transition-[letter-spacing] duration-200 group-hover:tracking-wide">Right</span>
        </Link>

        {/* Center nav links (desktop) */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-[15px] font-medium transition-colors',
                  isActive ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:text-text-primary'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/explore" className="rounded-full p-2 text-text-secondary hover:bg-bg-secondary" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>
          {isAuthenticated ? (
            <>
              <Button to="/create" size="sm">
                <Plus className="h-4 w-4" /> New Recipe
              </Button>
              <Button to="/me" variant="ghost" size="sm">
                <UserIcon className="h-4 w-4" /> Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Log out
              </Button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-full transition hover:opacity-90"
                  aria-label="Account menu"
                >
                  <Avatar src={user?.avatar?.url} name={user?.name} size="md" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-lg"
                      >
                        <div className="px-3 py-2">
                          <p className="truncate text-sm font-medium">{user?.name}</p>
                          <p className="truncate text-xs text-text-tertiary">{user?.email}</p>
                        </div>
                        <Link
                          to="/me"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-bg-secondary"
                        >
                          <UserIcon className="h-4 w-4" /> My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login">
                Log in
              </Button>
              <Button size="sm" to="/register">
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-full p-2 text-text-primary md:hidden"
          onClick={() => setDrawerOpen((o) => !o)}
          aria-label="Menu"
        >
          {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] bg-bg-primary md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-base font-medium',
                      isActive ? 'bg-accent-soft text-accent' : 'text-text-secondary'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <hr className="my-2 border-[var(--border)]" />
              {isAuthenticated ? (
                <>
                  <Button
                    to="/create"
                    className="w-full justify-start rounded-xl"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Plus className="h-4 w-4" /> New Recipe
                  </Button>
                  <Button
                    to="/me"
                    variant="ghost"
                    className="w-full justify-start rounded-xl"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" /> My Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl text-red-500 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    to="/login"
                    variant="ghost"
                    className="w-full justify-start rounded-xl"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Log in
                  </Button>
                  <Button
                    to="/register"
                    className="w-full justify-start rounded-xl"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
