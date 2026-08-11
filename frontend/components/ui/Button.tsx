import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  iconOnly?: boolean;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: "rf-btn-primary",
  secondary: "rf-btn-secondary",
  ghost: "rf-btn-ghost",
  danger: "rf-btn-danger",
};

export function Button({
  variant = "secondary",
  iconOnly = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rf-btn ${variantClass[variant]}${iconOnly ? " rf-btn-icon" : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
