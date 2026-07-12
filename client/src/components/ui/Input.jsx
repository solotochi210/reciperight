import { forwardRef, useId, useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Text input with a floating label and error state.
 * Forward-ref so it plugs straight into React Hook Form's register().
 */
const Input = forwardRef(function Input(
  { label, error, type = 'text', className, value, defaultValue, onChange, onBlur, ...props },
  ref
) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(value ?? defaultValue ?? '')
  );

  const floated = focused || hasValue;

  return (
    <div className={cn('relative w-full', className)}>
      <input
        id={id}
        ref={ref}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setHasValue(Boolean(e.target.value));
          onBlur?.(e);
        }}
        onChange={(e) => {
          setHasValue(Boolean(e.target.value));
          onChange?.(e);
        }}
        className={cn(
          'peer w-full rounded-[14px] border bg-white/70 px-4 pb-2 pt-5 text-[15px] text-text-primary outline-none transition-all',
          'placeholder-transparent',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-[var(--border)] focus:border-accent focus:ring-2 focus:ring-accent/20'
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-4 transition-all duration-200',
            floated
              ? 'top-1.5 text-[11px] font-medium text-text-tertiary'
              : 'top-1/2 -translate-y-1/2 text-[15px] text-text-tertiary'
          )}
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 px-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
