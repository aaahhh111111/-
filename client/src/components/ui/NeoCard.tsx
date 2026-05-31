import { ReactNode } from 'react'

interface NeoCardProps {
  children: ReactNode
  className?: string
  bgColor?: 'white' | 'yellow' | 'muted' | 'black'
  hover?: boolean
}

export default function NeoCard({ 
  children, 
  className = '', 
  bgColor = 'white',
  hover = true 
}: NeoCardProps) {
  const bgColors = {
    white: 'bg-white',
    yellow: 'bg-[#FFD93D]',
    muted: 'bg-[#C4B5FD]',
    black: 'bg-black text-white',
  }

  return (
    <div 
      className={`
        ${bgColors[bgColor]}
        border-4 border-black
        shadow-[8px_8px_0px_0px_#000]
        ${hover ? 'hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
