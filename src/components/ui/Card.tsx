import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
  interactive?: boolean;
  padded?: boolean;
}

/**
 * The one card surface for the whole app: white surface, one light border,
 * one shadow token. `interactive` adds a uniform hover lift used everywhere.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ as = "div", interactive, padded, className = "", ...props }, ref) => {
    const Tag = as as React.ElementType;
    return (
      <Tag
        ref={ref}
        className={
          "bg-surface border border-line rounded-md shadow-card " +
          (interactive
            ? "transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-pop hover:border-line-strong "
            : "") +
          (padded ? "p-5 " : "") +
          className
        }
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
export default Card;
