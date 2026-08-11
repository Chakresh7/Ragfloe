"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

type NewOrgDialogProps = {
  open: boolean;
  name: string;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function NewOrgDialog({
  open,
  name,
  onNameChange,
  onClose,
  onConfirm,
}: NewOrgDialogProps) {
  return (
    <Dialog
      open={open}
      title="New organization"
      confirmLabel="Create organization"
      confirmDisabled={!name.trim()}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.85rem" }}>
        <span style={{ color: "var(--ink-muted)" }}>Name</span>
        <Input
          autoFocus
          placeholder="Acme AI"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </label>
    </Dialog>
  );
}
