import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-bg-secondary/50">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-text-tertiary sm:flex-row">
        <Link to="/" className="font-heading text-base text-text-primary">
          Recipe<span className="accent-text">Right</span>
        </Link>
        <p>Discover. Cook. Share.</p>
        <p>&copy; {new Date().getFullYear()} RecipeRight</p>
      </div>
    </footer>
  );
}
