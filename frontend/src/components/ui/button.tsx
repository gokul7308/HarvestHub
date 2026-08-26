import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-[#1B5E20] text-white hover:bg-[#144917] shadow-md hover:shadow-lg transition-all",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-gray-200 bg-white hover:bg-gray-100 text-slate-900",
      secondary: "bg-[#6D4C41] text-white hover:bg-[#5D4037]",
      ghost: "hover:bg-gray-100 hover:text-slate-900 text-slate-600",
      link: "text-primary underline-offset-4 hover:underline",
      accent: "bg-[#00E676] text-[#1B5E20] hover:bg-[#00C853] shadow-md hover:shadow-lg font-semibold",
    }
    
    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-xl px-4 text-xs",
      lg: "h-14 rounded-3xl px-8 text-base",
      icon: "h-10 w-10",
    }

    // fallback to generic types, or use template literal
    const variantStyle = (variants as any)[variant] || variants.default
    const sizeStyle = (sizes as any)[size] || sizes.default

    return (
      <Comp
        className={cn(baseStyles, variantStyle, sizeStyle, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
