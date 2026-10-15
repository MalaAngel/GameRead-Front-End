import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/format';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Blocks Esc / backdrop dismissal (e.g. lockdown notice). */
  dismissible?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'cream' | 'blue';
}

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' } as const;

export function Modal({ open, onClose, title, children, footer, dismissible = true, size = 'md', tone = 'cream' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && dismissible) onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open, dismissible, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/50" onClick={dismissible ? onClose : undefined} aria-hidden />
      <div
        ref={panelRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
        className={cn('relative max-h-[90vh] w-full overflow-y-auto rounded-card p-7 shadow-window scroll-soft',
          tone === 'cream' ? 'bg-cream' : 'bg-blue', widths[size])}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {dismissible && (
            <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-full p-1 hover:bg-navy-faint">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, loading }: {
  open: boolean; title: string; message: ReactNode; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <Modal
      open={open} onClose={onCancel} title={title} size="sm"
      footer={<>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'solid'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>}
    >
      <p className="text-base">{message}</p>
    </Modal>
  );
}
