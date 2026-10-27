import { useEffect, useLayoutEffect, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal behavior for a panel: focuses `initialFocus` on open, closes on Esc,
 * and keeps Tab inside the panel. Returns the keydown handler for the panel.
 */
export function useDialog(open: boolean, onClose: () => void, panel: RefObject<HTMLElement>, initialFocus: RefObject<HTMLElement>) {
  // Focus right after the panel renders, so even an instant Tab stays inside it.
  useLayoutEffect(() => {
    if (open) initialFocus.current?.focus({ preventScroll: true });
  }, [open, initialFocus]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return function trapTab(e: KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Tab' || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
}
