import { forwardRef, ButtonHTMLAttributes } from 'react'

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'white' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const NeoButton = forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = `
      relative font-bold uppercase tracking-wide
      border-4 border-black rounded-none
      transition-all duration-100 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
      ${className}
    `

    const variants = {
      primary: 'bg-[#FF6B6B] text-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5',
      secondary: 'bg-[#C4B5FD] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5',
      yellow: 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5',
      white: 'bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5',
      ghost: 'bg-transparent text-black border-2 border-black shadow-none hover:bg-black hover:text-white',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

NeoButton.displayName = 'NeoButton'

export default NeoButton
