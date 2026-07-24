import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
} from 'react'
import {
  AnnotateIcon,
  DownloadIcon,
  FitWidthIcon,
  MenuIcon,
  PrintIcon,
  RotateIcon,
  SearchIcon,
  TextSelectIcon,
} from './assets/icons'
import brandLogo from './assets/icons/logo.png'
import leftDecor from './assets/icons/left@1x.png'
import { numberIcons } from './assets/icons/numbers'
import rightDecor from './assets/icons/right@1x.png'
import reviewSystemImg from './assets/images/review-system.png'
import {
  docTabs,
  evaluationItems,
  evaluationSystems,
  navTabs,
  projectInfo,
} from './data'
import { PdfViewer, type PdfFitMode } from './PdfViewer'
import { RevealCard } from './RevealCard'
import { TypewriterText } from './TypewriterText'
import './App.css'

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>

const systemImages: Record<string, string> = {
  construction: reviewSystemImg,
}

function App() {
  const [activeNav, setActiveNav] = useState<(typeof navTabs)[number]['id']>('basic')
  const [activeDoc, setActiveDoc] = useState<(typeof docTabs)[number]['id']>('bidding')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [fitMode, setFitMode] = useState<PdfFitMode>('adaptive')
  const [refitToken, setRefitToken] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [preview, setPreview] = useState<{ title: string; src: string } | null>(null)
  const [previewZoom, setPreviewZoom] = useState(1)
  const lightboxBodyRef = useRef<HTMLDivElement>(null)

  // 入场动效阶段
  const [basicVisible, setBasicVisible] = useState(false)
  const [basicTyping, setBasicTyping] = useState(false)
  const [basicTypedDone, setBasicTypedDone] = useState(false)
  const [itemsTitleVisible, setItemsTitleVisible] = useState(false)
  const [visibleEvalCount, setVisibleEvalCount] = useState(0)
  const [typingEvalIndex, setTypingEvalIndex] = useState(-1)
  const [systemVisible, setSystemVisible] = useState(false)
  const [leftWidthPct, setLeftWidthPct] = useState(40)
  const [isResizing, setIsResizing] = useState(false)
  const workspaceRef = useRef<HTMLDivElement>(null)

  const PREVIEW_ZOOM_MIN = 0.5
  const PREVIEW_ZOOM_MAX = 3
  const PREVIEW_ZOOM_STEP = 0.25

  const clampPreviewZoom = useCallback((value: number) => {
    return Math.min(PREVIEW_ZOOM_MAX, Math.max(PREVIEW_ZOOM_MIN, Math.round(value * 100) / 100))
  }, [])

  const openPreview = useCallback((next: { title: string; src: string }) => {
    setPreviewZoom(1)
    setPreview(next)
  }, [])

  const zoomPreviewBy = useCallback(
    (delta: number) => {
      setPreviewZoom((z) => clampPreviewZoom(z + delta))
    },
    [clampPreviewZoom],
  )

  useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview])

  // 同源预取 PDF（避免跨域 CDN 在 Chrome 中缓存/CORS 冲突）
  useEffect(() => {
    const links: HTMLLinkElement[] = []
    for (const tab of docTabs) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = tab.file
      document.head.appendChild(link)
      links.push(link)
    }
    return () => {
      links.forEach((l) => l.remove())
    }
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const onMove = (e: MouseEvent) => {
      const root = workspaceRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setLeftWidthPct(Math.min(70, Math.max(28, pct)))
    }

    const onUp = () => setIsResizing(false)

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing])

  const startResize = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  // 页面初始：先露出项目基本信息卡片，再开始打字
  useEffect(() => {
    const t1 = window.setTimeout(() => setBasicVisible(true), 180)
    const t2 = window.setTimeout(() => setBasicTyping(true), 520)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  const handleBasicTyped = useCallback(() => {
    setBasicTypedDone(true)
    setItemsTitleVisible(true)
    window.setTimeout(() => {
      setVisibleEvalCount(1)
      setTypingEvalIndex(0)
    }, 360)
  }, [])

  const handleEvalTyped = useCallback((index: number) => {
    setTypingEvalIndex(-1)
    const next = index + 1
    if (next < evaluationItems.length) {
      window.setTimeout(() => {
        setVisibleEvalCount(next + 1)
        setTypingEvalIndex(next)
      }, 220)
      return
    }
    window.setTimeout(() => setSystemVisible(true), 280)
  }, [])

  const activeDocMeta = useMemo(
    () => docTabs.find((tab) => tab.id === activeDoc) ?? docTabs[0],
    [activeDoc],
  )

  const switchDoc = (id: (typeof docTabs)[number]['id']) => {
    setActiveDoc(id)
    setCurrentPage(1)
    setTotalPages(0)
    setScale(1)
    setRotation(0)
  }

  const jumpToDocPage = (
    docId: (typeof docTabs)[number]['id'],
    page: number,
  ) => {
    setActiveDoc(docId)
    setCurrentPage(page)
    setScale(1)
    setRotation(0)
  }

  const downloadFile = () => {
    if (!activeDocMeta.file) return
    const link = document.createElement('a')
    link.href = activeDocMeta.file
    link.download = activeDocMeta.label
    link.click()
  }

  const printFile = () => {
    if (!activeDocMeta.file) return
    window.open(activeDocMeta.file, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="app">
      <header className="top-bar">
        <div className="top-bar__brand">
          <span className="top-bar__logo" aria-hidden="true">
            <img src={brandLogo} alt="" width={24} height={28} />
          </span>
          <span className="top-bar__title">AI智能评标</span>
        </div>
        <div className="top-bar__project">
          {projectInfo.name}
          <span className="top-bar__project-id">（{projectInfo.id}）</span>
        </div>
      </header>

      <div
        className={`workspace${isResizing ? ' is-resizing' : ''}`}
        ref={workspaceRef}
        style={{
          gridTemplateColumns: `minmax(0, ${leftWidthPct}%) 6px minmax(0, 1fr)`,
        }}
      >
        <aside className="panel panel--left">
          <div className="panel__header">
            <h1 className="panel__title">AI智能评标</h1>
            <nav className="nav-tabs" aria-label="评标导航">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`nav-tabs__item${activeNav === tab.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setActiveNav(tab.id)
                    document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="panel__body">
            <section
              className={`section reveal-block${basicVisible ? ' is-visible' : ''}`}
              id="basic"
            >
              <SectionTitle>项目基本信息</SectionTitle>
              <div
                className={`info-card reveal-card${basicVisible ? ' is-visible' : ''}${
                  basicTyping && !basicTypedDone ? ' card--typing' : ''
                }`}
              >
                <TypewriterText
                  className="info-card__text"
                  text={projectInfo.summary}
                  active={basicTyping}
                  speed={42}
                  onComplete={handleBasicTyped}
                />
              </div>
            </section>

            {itemsTitleVisible ? (
            <section
              className="section reveal-block is-visible"
              id="items"
            >
              <SectionTitle>评审项基本情况</SectionTitle>
              <div className="eval-list">
                {evaluationItems.slice(0, visibleEvalCount).map((item, index) => (
                  <RevealCard
                    key={item.no}
                    as="article"
                    className={`eval-card${typingEvalIndex === index ? ' card--typing' : ''}`}
                    delayMs={30}
                  >
                    <img
                      className="eval-card__no"
                      src={numberIcons[item.no]}
                      alt=""
                      aria-hidden="true"
                    />
                    <div className="eval-card__content">
                      <h3 className="eval-card__title">{item.title}</h3>
                      <TypewriterText
                        className="eval-card__desc"
                        text={item.desc}
                        active={typingEvalIndex === index}
                        speed={46}
                        onComplete={() => handleEvalTyped(index)}
                        suffix={
                          <button
                            type="button"
                            className="page-tag"
                            title={`定位到${item.tag}`}
                            onClick={() => jumpToDocPage(item.doc, item.page)}
                          >
                            {item.tag}
                          </button>
                        }
                      />
                    </div>
                  </RevealCard>
                ))}
              </div>
            </section>
            ) : null}

            {systemVisible ? (
            <section
              className="section reveal-block is-visible"
              id="system"
            >
              <SectionTitle>评审体系</SectionTitle>
              <div className="system-list">
                {evaluationSystems.map((item) => (
                  <RevealCard key={item.id} delayMs={40}>
                    <button
                      type="button"
                      className="system-card"
                      onClick={() => {
                        const src = systemImages[item.id]
                        if (src) openPreview({ title: item.title, src })
                      }}
                    >
                      <div className="system-card__main">
                        <span className="system-card__icon" aria-hidden="true">
                          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                            <rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <path
                              d="M5.5 13.5l3-3.5 2.2 2.2 3.8-4.7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="7.2" cy="8" r="1.1" fill="currentColor" />
                          </svg>
                        </span>
                        <span className="system-card__title">{item.title}</span>
                      </div>
                      <span className="system-card__preview" aria-hidden="true">
                        <img src={systemImages[item.id]} alt="" className="system-card__thumb" />
                      </span>
                    </button>
                  </RevealCard>
                ))}
              </div>
            </section>
            ) : null}
          </div>
        </aside>

        <div
          className="workspace-splitter"
          role="separator"
          aria-orientation="vertical"
          aria-label="拖动调整左右栏宽度"
          aria-valuenow={Math.round(leftWidthPct)}
          onMouseDown={startResize}
        />

        <section className="panel panel--right">
          <div className="doc-tabs">
            {docTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`doc-tabs__item${activeDoc === tab.id ? ' is-active' : ''}`}
                onClick={() => switchDoc(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="viewer-toolbar">
            <div className="viewer-toolbar__left">
              <ToolbarButton label="目录" icon={MenuIcon} />
              <ToolbarButton label="搜索" icon={SearchIcon} />
              <div className="page-ctrl">
                <button
                  type="button"
                  className="page-ctrl__btn"
                  aria-label="上一页"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  −
                </button>
                <span className="page-ctrl__text">
                  {totalPages > 0 ? `${currentPage} / ${totalPages}` : '— / —'}
                </span>
                <button
                  type="button"
                  className="page-ctrl__btn"
                  aria-label="下一页"
                  disabled={totalPages === 0 || currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="viewer-toolbar__right">
              <div className="fit-mode" role="group" aria-label="文档显示模式">
                <button
                  type="button"
                  className={`fit-mode__btn${fitMode === 'adaptive' ? ' is-active' : ''}`}
                  title="随右侧栏宽自动缩放"
                  onClick={() => {
                    setFitMode('adaptive')
                    setScale(1)
                  }}
                >
                  自适应
                </button>
                <button
                  type="button"
                  className={`fit-mode__btn${fitMode === 'fixed' ? ' is-active' : ''}`}
                  title="锁定当前显示宽度，拖拽调栏时不再变化"
                  onClick={() => setFitMode('fixed')}
                >
                  固定
                </button>
              </div>
              <ToolbarButton
                label="适应宽度"
                icon={FitWidthIcon}
                onClick={() => {
                  setScale(1)
                  if (fitMode === 'fixed') {
                    setRefitToken((n) => n + 1)
                  }
                }}
              />
              <ToolbarButton
                label="旋转"
                icon={RotateIcon}
                onClick={() => setRotation((r) => (r + 90) % 360)}
              />
              <ToolbarButton label="选择文本" icon={TextSelectIcon} />
              <ToolbarButton label="批注" icon={AnnotateIcon} />
              <ToolbarButton label="打印" icon={PrintIcon} onClick={printFile} />
              <ToolbarButton label="下载" icon={DownloadIcon} onClick={downloadFile} />
            </div>
          </div>

          <PdfViewer
            file={activeDocMeta.file}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLoadSuccess={setTotalPages}
            scale={scale}
            rotation={rotation}
            fitMode={fitMode}
            refitToken={refitToken}
          />
        </section>
      </div>

      {preview ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          onClick={() => setPreview(null)}
        >
          <div className="image-lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <div className="image-lightbox__header">
              <h3>{preview.title}</h3>
              <button
                type="button"
                className="image-lightbox__close"
                aria-label="关闭"
                onClick={() => setPreview(null)}
              >
                ×
              </button>
            </div>
            <div className="image-lightbox__body">
              <div className="image-lightbox__zoombar" role="toolbar" aria-label="图片缩放">
                <button
                  type="button"
                  className="image-lightbox__zoom-btn"
                  disabled={previewZoom <= PREVIEW_ZOOM_MIN}
                  onClick={() => zoomPreviewBy(-PREVIEW_ZOOM_STEP)}
                >
                  缩小
                </button>
                <button
                  type="button"
                  className="image-lightbox__zoom-label"
                  title="点击恢复 100%"
                  onClick={() => setPreviewZoom(1)}
                >
                  {Math.round(previewZoom * 100)}%
                </button>
                <button
                  type="button"
                  className="image-lightbox__zoom-btn"
                  disabled={previewZoom >= PREVIEW_ZOOM_MAX}
                  onClick={() => zoomPreviewBy(PREVIEW_ZOOM_STEP)}
                >
                  放大
                </button>
              </div>
              <div className="image-lightbox__scroll" ref={lightboxBodyRef}>
                <div
                  className="image-lightbox__stage"
                  style={{
                    width: `${previewZoom * 100}%`,
                    maxWidth: previewZoom <= 1 ? '100%' : undefined,
                  }}
                >
                  <img src={preview.src} alt={preview.title} draggable={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="section-title">
      <img
        className="section-title__decor section-title__decor--left"
        src={leftDecor}
        alt=""
        aria-hidden="true"
      />
      <h2>{children}</h2>
      <img
        className="section-title__decor section-title__decor--right"
        src={rightDecor}
        alt=""
        aria-hidden="true"
      />
    </div>
  )
}

function ToolbarButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: SvgIcon
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className="toolbar-btn"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon width={16} height={16} />
    </button>
  )
}

export default App
