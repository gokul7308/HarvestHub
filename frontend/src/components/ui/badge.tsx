import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-[#1B5E20] text-white",
    secondary: "border-transparent bg-[#6D4C41] text-white",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "text-slate-800",
    success: "border-transparent bg-[#00E676]/20 text-[#1B5E20] border-[#00E676]",
    warning: "border-transparent bg-amber-100 text-amber-800",
  }
  
  const variantStyle = (variants as any)[variant] || variants.default
  
  return (
    <div className={cn(baseStyles, variantStyle, className)} {...props} />
  )
}

export { Badge }
