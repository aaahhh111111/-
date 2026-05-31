import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const NeoInput = forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-bold uppercase tracking-wider text-black">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full h-14 px-4
            bg-white
            border-4 border-black
            text-black font-bold text-lg
            placeholder:text-black/40
            focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:ring-0
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)

NeoInput.displayName = 'NeoInput'

interface NeoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const NeoTextarea = forwardRef<HTMLTextAreaElement, NeoTextareaProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-bold uppercase tracking-wider text-black">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full min-h-[120px] px-4 py-3
            bg-white
            border-4 border-black
            text-black font-bold text-lg
            placeholder:text-black/40
            focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:ring-0
            resize-none
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)

NeoTextarea.displayName = 'NeoTextarea'

export default NeoInput
