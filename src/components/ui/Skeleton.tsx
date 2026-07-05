import React from "react";

/**
 * Loading placeholder with a left-to-right shimmer (reads as faster than a
 * pulse). Match the block's shape to the real content it stands in for.
 */
export default function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`sigup-skeleton rounded-sm ${className}`} {...props} />;
}
