import { cn } from "~/lib/utils"

interface SpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg"
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  }

  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      <div
        className={cn("animate-spin rounded-full border-[3px]", sizeClasses[size])}
        style={{
          // Use theme ring color (global black in current palette)
          borderColor: "hsl(var(--ring) / 0.2)",
          borderTopColor: "hsl(var(--ring))",
        }}
      />
    </div>
  )
}

export { Spinner }

