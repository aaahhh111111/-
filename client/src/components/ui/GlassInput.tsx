import { InputHTMLAttributes, forwardRef } from 'react'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/10 backdrop-blur-md
            border border-white/20
            text-white placeholder-white/40
            outline-none
            transition-all duration-200
            focus:border-white/40 focus:ring-2 focus:ring-white/20
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'

export default GlassInput
