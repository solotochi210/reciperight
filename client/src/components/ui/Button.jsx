import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'bg-accent text-white shadow-sm hover:shadow-glow hover:-translate-y-0.5',
  secondary: 'bg-transparent text-text-primary border border-[var(--border)] hover:bg-bg-secondary hover:border-accent/40',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-13 px-8 text-base py-3',
};

const MotionLink = motion(Link);

/**
 * Unified button component.
 * - Default: <button>
 * - `to` prop: React Router <Link> styled as a button (never nest Button inside Link)
 * - `href` prop: external <a> styled as a button
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  type = 'button',
  to,
  href,
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  const motionProps = {
    whileTap: { scale: isDisabled ? 1 : 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  };

  // Router link — avoids invalid <a><button> nesting
  if (to && !isDisabled) {
    return (
      <MotionLink
        to={to}
        className={classes}
        onClick={onClick}
        {...motionProps}
        {...props}
      >
        {content}
      </MotionLink>
    );
  }

  // External link
  if (href && !isDisabled) {
    return (
      <motion.a
        href={href}
        className={classes}
        onClick={onClick}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      className={classes}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
}
