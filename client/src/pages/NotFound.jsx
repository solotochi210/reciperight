import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1280px] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-6xl">404</h1>
      <p className="mt-4 text-text-secondary">This page slipped out of the recipe box.</p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
      >
        Back home
      </Link>
    </main>
  );
}
