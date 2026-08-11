"use client";

import { useEffect, useId, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

type DeleteProjectDialogProps = {
  open: boolean;
  projectName: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProjectDialog({
  open,
  projectName,
  busy = false,
  onClose,
  onConfirm,
}: DeleteProjectDialogProps) {
  const inputId = useId();
  const [confirmation, setConfirmation] = useState("");
  const matches = confirmation.trim() === projectName.trim();

  useEffect(() => {
    if (!open) {
      setConfirmation("");
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      title="Delete project"
      confirmLabel={busy ? "Deleting…" : "Delete project"}
      confirmVariant="danger"
      confirmDisabled={!matches || busy}
      onClose={() => {
        if (!busy) onClose();
      }}
      onConfirm={onConfirm}
    >
      <p className="rf-dialog-copy">
        This will permanently delete{" "}
        <strong>{projectName}</strong>. This cannot be undone.
      </p>
      <label className="rf-dialog-field" htmlFor={inputId}>
        <span>
          Type <strong>{projectName}</strong> to confirm
        </span>
        <Input
          id={inputId}
          name="confirmProjectName"
          autoFocus
          autoComplete="off"
          placeholder={projectName}
          value={confirmation}
          disabled={busy}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
    </Dialog>
  );
}
