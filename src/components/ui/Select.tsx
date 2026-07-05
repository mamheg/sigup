import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", children, ...props }, ref) => (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-medium text-ink">{label}</span>}
      <div className="relative">
        <select
          ref={ref}
          className={
            "w-full h-11 pl-3.5 pr-9 rounded-sm bg-surface border border-line text-ink appearance-none cursor-pointer " +
            "transition-colors duration-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 " +
            className
          }
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
      </div>
    </label>
  )
);
Select.displayName = "Select";
export default Select;
