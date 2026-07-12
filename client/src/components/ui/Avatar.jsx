import { useState } from 'react';
import { cn } from '../../utils/cn';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

const GRADIENTS = [
  'from-[#5b4be0] to-[#8a6bff]',
  'from-[#0ea5a3] to-[#5ad1bf]',
  'from-[#e0902e] to-[#f2b56b]',
  'from-[#d6456e] to-[#ff8fb0]',
];

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

export default function Avatar({ src, name = '', size = 'md', className }) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;
  const gradient = GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length];

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        SIZES[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            'flex h-full w-full items-center justify-center bg-gradient-to-br font-semibold text-white',
            gradient
          )}
        >
          {initials(name) || '?'}
        </span>
      )}
    </div>
  );
}
