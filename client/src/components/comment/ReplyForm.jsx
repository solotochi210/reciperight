import { useState } from 'react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../store/AuthContext';

export default function ReplyForm({ onSubmit, onCancel, submitting, placeholder = 'Add a comment…', compact = false }) {
  const { user } = useAuth();
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed, () => setValue(''));
  };

  return (
    <form onSubmit={submit} className="flex items-start gap-3">
      {!compact && <Avatar src={user?.avatar?.url} name={user?.name} size="md" />}
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className="w-full resize-none rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" loading={submitting} disabled={!value.trim()}>
            {compact ? 'Reply' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  );
}
