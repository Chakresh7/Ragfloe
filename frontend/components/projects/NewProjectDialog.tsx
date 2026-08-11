"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

type NewProjectDialogProps = {
  open: boolean;
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function NewProjectDialog({
  open,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onClose,
  onConfirm,
}: NewProjectDialogProps) {
  return (
    <Dialog
      open={open}
      title="New project"
      confirmLabel="Create project"
      confirmDisabled={!name.trim()}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.85rem" }}>
        <span style={{ color: "var(--ink-muted)" }}>Name</span>
        <Input
          autoFocus
          placeholder="Legal AI"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </label>
      <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.85rem" }}>
        <span style={{ color: "var(--ink-muted)" }}>Description</span>
        <Input
          placeholder="Short project description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </label>
    </Dialog>
  );
}
