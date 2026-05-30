import { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover'
}

export default function GlassCard({
  className = '',
  variant = 'default',
  children,
  ...props
}: GlassCardProps) {
  const variants = {
    default: 'bg-white/10 backdrop-blur-xl border border-white/20',
    hover: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300',
  }

  return (
    <div
      className={`
        rounded-2xl shadow-xl
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        px-6 py-4 border-b border-white/10
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function GlassFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        px-6 py-4 border-t border-white/10
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
