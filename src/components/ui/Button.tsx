import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-sm " +
  "transition-[color,background-color,border-color,scale] duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

// Tactile press feedback — always 0.96 (below 0.95 feels exaggerated).
const tapScale = "active:not-disabled:scale-[0.96]";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg hover:bg-brand-hover",
  secondary: "bg-surface text-ink border border-line hover:border-line-strong hover:bg-canvas",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-brand-muted",
  gold: "bg-gold text-white hover:bg-gold-dark",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** Disable the scale-on-press feedback when motion would be distracting. */
  static?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, static: isStatic, className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${!isStatic ? tapScale : ""} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
export default Button;
