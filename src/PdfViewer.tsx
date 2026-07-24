import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './PdfViewer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export type PdfFitMode = 'adaptive' | 'fixed'

type PdfViewerProps = {
  file: string | null
  currentPage: number
  onPageChange: (page: number) => void
  onLoadSuccess: (numPages: number) => void
  /** 相对基准宽度的缩放，1 = 基准宽度 */
  scale: number
  rotation: number
  /** adaptive: 随栏宽变化；fixed: 锁定当前宽度 */
  fitMode: PdfFitMode
  /** 递增时在固定模式下按当前栏宽重新锁定 */
  refitToken?: number
}

const PAGE_GAP = 16
const THUMB_GAP = 10
const THUMB_WIDTH = 64
const THUMB_HEIGHT = 84
const THUMB_ITEM_HEIGHT = THUMB_HEIGHT + 18 + THUMB_GAP // preview + label + gap
const MAIN_BUFFER = 2
const THUMB_BUFFER = 6

function useScrollVisibleRange(
  scrollerRef: RefObject<HTMLElement | null>,
  itemCount: number,
  itemStride: number,
  buffer: number,
  enabled: boolean,
) {
  const [range, setRange] = useState({ start: 1, end: Math.min(itemCount || 1, buffer * 2 + 1) })

  useEffect(() => {
    if (!enabled || itemCount <= 0 || itemStride <= 0) return
    const el = scrollerRef.current
    if (!el) return

    const update = () => {
      const start = Math.max(1, Math.floor(el.scrollTop / itemStride) + 1 - buffer)
      const visible = Math.ceil(el.clientHeight / itemStride) + 1
      const end = Math.min(itemCount, start + visible + buffer)
      setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [scrollerRef, itemCount, itemStride, buffer, enabled])

  return range
}

export function PdfViewer({
  file,
  currentPage,
  onPageChange,
  onLoadSuccess,
  scale,
  rotation,
  fitMode,
  refitToken = 0,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [stageWidth, setStageWidth] = useState(0)
  const [lockedWidth, setLockedWidth] = useState<number | null>(null)
  const [pageHeight, setPageHeight] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const pageFromScroll = useRef(currentPage)
  const fileSource = useMemo(() => file, [file])

  useEffect(() => {
    setNumPages(0)
    setPageHeight(0)
    pageRefs.current.clear()
    pageFromScroll.current = -1
  }, [file])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const update = () => {
      const padding = 32
      const next = Math.max(240, el.clientWidth - padding)
      setStageWidth(next)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [file])

  useEffect(() => {
    if (fitMode !== 'fixed') {
      setLockedWidth(null)
      return
    }
    if (stageWidth > 0) {
      setLockedWidth(stageWidth)
    }
  }, [fitMode, refitToken])

  useEffect(() => {
    if (fitMode === 'fixed' && lockedWidth === null && stageWidth > 0) {
      setLockedWidth(stageWidth)
    }
  }, [fitMode, lockedWidth, stageWidth])

  const baseWidth = fitMode === 'fixed' ? (lockedWidth ?? stageWidth) : stageWidth
  const pageWidth = baseWidth > 0 ? Math.floor(baseWidth * scale) : undefined

  // A4 fallback until first page reports real height
  const estimatedPageHeight =
    pageHeight > 0
      ? pageHeight
      : pageWidth
        ? Math.round(pageWidth * (rotation % 180 === 0 ? 1.414 : 1 / 1.414))
        : 0

  const mainStride = estimatedPageHeight > 0 ? estimatedPageHeight + PAGE_GAP : 0
  const mainRange = useScrollVisibleRange(
    stageRef,
    numPages,
    mainStride,
    MAIN_BUFFER,
    numPages > 0 && mainStride > 0,
  )
  const thumbRange = useScrollVisibleRange(
    thumbRef,
    numPages,
    THUMB_ITEM_HEIGHT,
    THUMB_BUFFER,
    numPages > 0,
  )

  // Always include current page in both windows (page-tag jumps)
  const mainStart = Math.min(mainRange.start, Math.max(1, currentPage - MAIN_BUFFER))
  const mainEnd = Math.max(mainRange.end, Math.min(numPages || 1, currentPage + MAIN_BUFFER))
  const thumbStart = Math.min(thumbRange.start, Math.max(1, currentPage - THUMB_BUFFER))
  const thumbEnd = Math.max(thumbRange.end, Math.min(numPages || 1, currentPage + THUMB_BUFFER))

  const handleLoad = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total)
      onLoadSuccess(total)
    },
    [onLoadSuccess],
  )

  const onFirstPageRenderSuccess = useCallback((page: { height: number }) => {
    if (page.height > 0) setPageHeight(page.height)
  }, [])

  const scrollToPage = useCallback(
    (page: number) => {
      const el = pageRefs.current.get(page)
      if (el) {
        pageFromScroll.current = page
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      // Virtualized: jump by estimated offset before the page mounts
      const stage = stageRef.current
      if (!stage || estimatedPageHeight <= 0) return false
      pageFromScroll.current = page
      stage.scrollTo({
        top: (page - 1) * (estimatedPageHeight + PAGE_GAP),
        behavior: 'smooth',
      })
      return true
    },
    [estimatedPageHeight],
  )

  useEffect(() => {
    if (numPages === 0) return
    if (currentPage === pageFromScroll.current) return
    if (scrollToPage(currentPage)) return
    const timer = window.setTimeout(() => {
      scrollToPage(currentPage)
    }, 50)
    return () => window.clearTimeout(timer)
  }, [currentPage, numPages, scrollToPage])

  // Keep active thumb in view
  useEffect(() => {
    const list = thumbRef.current
    if (!list || numPages === 0) return
    const top = (currentPage - 1) * THUMB_ITEM_HEIGHT
    const bottom = top + THUMB_ITEM_HEIGHT
    if (top < list.scrollTop) {
      list.scrollTo({ top, behavior: 'smooth' })
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: bottom - list.clientHeight, behavior: 'smooth' })
    }
  }, [currentPage, numPages])

  const handleStageScroll = () => {
    const stage = stageRef.current
    if (!stage || estimatedPageHeight <= 0) return

    const marker = stage.scrollTop + 48
    const active = Math.min(
      numPages,
      Math.max(1, Math.floor(marker / (estimatedPageHeight + PAGE_GAP)) + 1),
    )

    if (active !== pageFromScroll.current) {
      pageFromScroll.current = active
      onPageChange(active)
    }
  }

  if (!file) {
    return (
      <div className="viewer-body">
        <div className="pdf-empty">
          <p>暂无其他文件</p>
        </div>
      </div>
    )
  }

  return (
    <div className="viewer-body">
      <div className="pdf-layout">
        <aside className="thumb-list" aria-label="页面缩略图" ref={thumbRef}>
          <Document file={fileSource} loading={null} onLoadSuccess={handleLoad}>
            <div
              className="thumb-list__spacer"
              style={{ height: Math.max(0, numPages) * THUMB_ITEM_HEIGHT }}
            >
              {numPages > 0
                ? Array.from({ length: Math.max(0, thumbEnd - thumbStart + 1) }, (_, i) => {
                    const page = thumbStart + i
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`thumb${currentPage === page ? ' is-active' : ''}`}
                        style={{ top: (page - 1) * THUMB_ITEM_HEIGHT }}
                        onClick={() => onPageChange(page)}
                      >
                        <div className="thumb__preview thumb__preview--pdf">
                          <Page
                            pageNumber={page}
                            width={THUMB_WIDTH}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                        <span className="thumb__no">{page}</span>
                      </button>
                    )
                  })
                : null}
            </div>
          </Document>
        </aside>

        <div className="doc-stage" ref={stageRef} onScroll={handleStageScroll}>
          <Document
            file={fileSource}
            loading={<div className="pdf-loading">正在加载文档…</div>}
            error={<div className="pdf-empty">文档加载失败</div>}
            className="pdf-pages"
          >
            {numPages > 0 && pageWidth ? (
              <div
                className="pdf-pages__spacer"
                style={{
                  height: numPages * estimatedPageHeight + Math.max(0, numPages - 1) * PAGE_GAP,
                  width: '100%',
                }}
              >
                {Array.from({ length: Math.max(0, mainEnd - mainStart + 1) }, (_, i) => {
                  const page = mainStart + i
                  const top = (page - 1) * (estimatedPageHeight + PAGE_GAP)
                  return (
                    <div
                      key={page}
                      className="pdf-page-wrap pdf-page-wrap--abs"
                      style={{
                        top,
                        height: estimatedPageHeight,
                        width: '100%',
                      }}
                      ref={(node) => {
                        if (node) pageRefs.current.set(page, node)
                        else pageRefs.current.delete(page)
                      }}
                    >
                      <Page
                        pageNumber={page}
                        width={pageWidth}
                        rotate={rotation}
                        className="pdf-page"
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onRenderSuccess={page === 1 ? onFirstPageRenderSuccess : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            ) : null}
          </Document>
        </div>
      </div>
    </div>
  )
}
