/** Hand-drawn rising line used as a section divider throughout the template. */
export function ScSquiggle({
  className,
  stroke = "#74DF93",
  width = 6,
  arrow = false,
}: {
  className?: string;
  stroke?: string;
  width?: number;
  arrow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 420 52"
      aria-hidden
      className={`block h-auto overflow-visible ${className ?? ""}`}
    >
      <path
        d="M8 40 Q 32 12 56 38 T 104 36 T 152 32 T 200 28 T 248 24 T 296 20 T 344 16 T 392 10"
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {arrow && (
        <path
          d="M368 14 L 392 10 L 388 32"
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
