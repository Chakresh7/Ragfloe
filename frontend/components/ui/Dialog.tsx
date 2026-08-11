"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";
import { Button } from "./Button";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
};

export function Dialog({
  open,
  title,
  children,
  confirmLabel = "Create",
  onClose,
  onConfirm,
  confirmDisabled = false,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!confirmDisabled) onConfirm();
  }

  return (
    <div className="rf-dialog-backdrop" role="presentation" onClick={onClose}>
      <form
        className="rf-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>{title}</h2>
        {children}
        <div className="rf-dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
