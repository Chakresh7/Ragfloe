"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  panelClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Dropdown({
  trigger,
  children,
  align = "right",
  panelClassName = "",
  open: openProp,
  onOpenChange,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const rootRef = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync open/close only
  }, [open]);

  return (
    <div className="rf-menu" ref={rootRef}>
      <div
        onClick={(event) => {
          event.stopPropagation();
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(!open);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {open ? (
        <div
          className={`rf-menu-panel${panelClassName ? ` ${panelClassName}` : ""}`}
          role="menu"
          style={align === "left" ? { left: 0, right: "auto" } : undefined}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
