import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  withSearchIcon?: boolean;
};

export function Input({
  withSearchIcon = false,
  className = "",
  ...props
}: InputProps) {
  if (withSearchIcon) {
    return (
      <div className="rf-input-with-icon">
        <Search aria-hidden="true" />
        <input className={`rf-input ${className}`.trim()} {...props} />
      </div>
    );
  }

  return <input className={`rf-input ${className}`.trim()} {...props} />;
}
