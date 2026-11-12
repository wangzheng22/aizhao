/** 在指定滚动容器内平滑滚动，使目标元素进入可视区域 */
export function scrollSectionIntoContainer(
  container: HTMLElement,
  target: HTMLElement,
  offsetTop = 8,
) {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const fullyVisible =
    targetRect.top >= containerRect.top + offsetTop &&
    targetRect.bottom <= containerRect.bottom - offsetTop;

  if (fullyVisible) return;

  const nextTop =
    targetRect.top - containerRect.top + container.scrollTop - offsetTop;

  container.scrollTo({
    top: Math.max(0, nextTop),
    behavior: 'smooth',
  });
}
