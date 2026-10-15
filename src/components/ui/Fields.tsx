import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/format';

interface FieldShellProps { label: string; error?: string; hint?: string; id: string; children: ReactNode }

function FieldShell({ label, error, hint, id, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-serif text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-navy-soft">{hint}</p>}
      {error && <p className="text-xs font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}

const control = 'h-12 w-full rounded-xl border border-navy/40 bg-cream px-4 font-serif text-base text-navy placeholder:text-navy/40 focus:border-accent';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; hint?: string }
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} error={error} hint={hint} id={fid}>
      <input ref={ref} id={fid} aria-invalid={!!error} className={cn(control, error && 'border-danger', className)} {...rest} />
    </FieldShell>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string; options: { value: string; label: string }[] }
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, options, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} error={error} id={fid}>
      <select ref={ref} id={fid} className={cn(control, className)} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldShell>
  );
});

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative h-7 w-12 shrink-0 rounded-pill transition-colors', checked ? 'bg-accent' : 'bg-navy/30')}
    >
      <span className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}
