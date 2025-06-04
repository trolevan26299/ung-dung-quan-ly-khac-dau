import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
                destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
                outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
                secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 shadow-sm",
                ghost: "hover:bg-gray-100 text-gray-700",
                link: "text-blue-600 underline-offset-4 hover:underline",
                active: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
                inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200",
                success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
                warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm",
                danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
                info: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
                light: "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
                xs: "h-7 px-2 text-xs",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants } 