import { cva, type VariantProps } from "class-variance-authority"

import { twMerge } from "tailwind-merge"

const button = cva(
  [
    "justify-center",
    "inline-flex",
    "items-center",
    "text-center",
    "border",
    "transition-all",
    "duration-150",
    "font-headline",
    "uppercase",
    "tracking-widest",
    "font-bold",
  ],
  {
    variants: {
      intent: {
        primary: [
          "blood-gradient",
          "text-on-secondary",
          "border-transparent",
          "hover:opacity-90",
          "active:scale-[0.98]",
        ],
        secondary: [
          "bg-transparent",
          "text-secondary",
          "border-secondary/40",
          "hover:bg-secondary/5",
          "hover:border-secondary/70",
        ],
        ghost: [
          "bg-transparent",
          "text-on-surface-variant",
          "border-outline-variant/40",
          "hover:bg-surface-container-high",
        ],
      },
      size: {
        sm: ["min-w-20", "min-h-11", "text-xs", "py-2.5", "px-5"],
        md: ["min-w-28", "min-h-11", "text-xs", "py-3", "px-7"],
        lg: ["min-w-36", "min-h-13", "text-sm", "py-4", "px-10"],
      },
      underline: { true: ["underline"], false: [] },
    },
    defaultVariants: {
      intent: "primary",
      size: "lg",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof button> {
  underline?: boolean
  href: string
}

export function Button({ className, intent, size, underline, ...props }: ButtonProps) {
  return (
    <a className={twMerge(button({ intent, size, className, underline }))} {...props}>
      {props.children}
    </a>
  )
}
