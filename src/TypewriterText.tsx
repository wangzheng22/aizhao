import { useEffect, useRef, useState, type ReactNode } from 'react'

type TypewriterTextProps = {
  text: string
  active: boolean
  className?: string
  /** 打字结束后追加的节点（如 page-tag） */
  suffix?: ReactNode
  /** 每秒字数，默认 48 */
  speed?: number
  onComplete?: () => void
  as?: 'p' | 'span' | 'div'
}

export function TypewriterText({
  text,
  active,
  className,
  suffix,
  speed = 48,
  onComplete,
  as: Tag = 'p',
}: TypewriterTextProps) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!active) {
      // 打字结束后 active 会关掉，需保留已完成全文，不能清空
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setShown(text)
      setDone(true)
      onCompleteRef.current?.()
      return
    }

    let i = 0
    setShown('')
    setDone(false)
    const cps = Math.min(72, Math.max(28, speed))
    const delay = 1000 / cps

    const id = window.setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(id)
        setDone(true)
        onCompleteRef.current?.()
      }
    }, delay)

    return () => window.clearInterval(id)
  }, [active, text, speed])

  // 若已完成但 active 已关闭，确保仍显示全文
  useEffect(() => {
    if (!active && done) {
      setShown(text)
    }
  }, [active, done, text])

  return (
    <Tag className={className}>
      {shown}
      {active && !done ? <span className="typewriter-caret" aria-hidden="true" /> : null}
      {done ? suffix : null}
    </Tag>
  )
}
