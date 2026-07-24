import { useEffect, useState, type ReactNode } from 'react'

/** 挂载后触发自上而下入场 */
export function RevealCard({
  children,
  className = '',
  delayMs = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delayMs?: number
  as?: 'div' | 'article'
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [delayMs])

  return (
    <Tag className={`reveal-card${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </Tag>
  )
}
