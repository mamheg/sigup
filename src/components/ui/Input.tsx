import React from "react";

const fieldBase =
  "w-full h-11 px-3.5 rounded-sm bg-surface border border-line text-ink placeholder:text-ink-faint " +
  "transition-colors duration-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-medium text-ink">{label}</span>}
      <input
        ref={ref}
        id={id}
        className={`${fieldBase} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""} ${className}`}
        {...props}
      />
      {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
    </label>
  )
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-medium text-ink">{label}</span>}
      <textarea
        ref={ref}
        className={`${fieldBase} h-auto py-2.5 resize-y ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""} ${className}`}
        {...props}
      />
      {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
    </label>
  )
);
Textarea.displayName = "Textarea";

export default Input;
