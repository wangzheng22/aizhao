import './AppBrandLogo.css';

type AppBrandLogoProps = {
  className?: string;
  /** 传入时可点击（如返回项目列表） */
  onClick?: () => void;
  /** 可点击时的无障碍说明 */
  ariaLabel?: string;
};

const LOGO_SRC = `${import.meta.env.BASE_URL}brand-logo.png`;
/** 与文件编制页顶栏 Logo 一致 */
const LOGO_SIZE_PX = 28;

export function AppBrandLogo({
  className = '',
  onClick,
  ariaLabel = '返回项目列表',
}: AppBrandLogoProps) {
  const img = (
    <img
      src={LOGO_SRC}
      alt=""
      className={['app-brand-logo', className].filter(Boolean).join(' ')}
      width={LOGO_SIZE_PX}
      height={LOGO_SIZE_PX}
      decoding="async"
    />
  );

  if (!onClick) {
    return img;
  }

  return (
    <button type="button" className="app-brand-logo__hit" aria-label={ariaLabel} onClick={onClick}>
      {img}
    </button>
  );
}
