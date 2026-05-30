import { TextareaHTMLAttributes, forwardRef } from 'react'

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/10 backdrop-blur-md
            border border-white/20
            text-white placeholder-white/40
            outline-none
            transition-all duration-200
            resize-none
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

GlassTextarea.displayName = 'GlassTextarea'

export default GlassTextarea
