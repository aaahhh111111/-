import { forwardRef, ButtonHTMLAttributes } from 'react'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = `
      relative overflow-hidden rounded-xl font-medium
      backdrop-blur-md border border-white/20
      transition-all duration-200 ease-out
      hover:scale-[1.02] hover:shadow-lg
      active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      ${className}
    `

    const variants = {
      primary: 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-blue-500/25',
      secondary: 'bg-white/10 text-white border-white/30 hover:bg-white/20',
      danger: 'bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white shadow-red-500/25',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-7 py-3.5 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }
)

GlassButton.displayName = 'GlassButton'

export default GlassButton
