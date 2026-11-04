/** 在 PDF 抽取的正文中定位 needle（兼容换行、多空格差异） */
export function findNeedleInText(
  haystack: string,
  needle: string,
): { start: number; length: number } | null {
  const trimmed = needle.trim();
  if (!trimmed) return null;

  const direct = haystack.indexOf(trimmed);
  if (direct >= 0) {
    return { start: direct, length: trimmed.length };
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const pattern = tokens
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[\\s\\u00a0\\n\\r]+');
  const regex = new RegExp(pattern);
  const match = regex.exec(haystack);
  if (match) {
    return { start: match.index, length: match[0].length };
  }

  const compactHay = haystack.replace(/\s+/g, '');
  const compactNeedle = trimmed.replace(/\s+/g, '');
  if (compactNeedle.length >= 4 && compactHay.includes(compactNeedle)) {
    const mapped = mapCompactMatchToOriginal(haystack, compactNeedle);
    if (mapped) return mapped;
  }

  return null;
}

function mapCompactMatchToOriginal(
  haystack: string,
  compactNeedle: string,
): { start: number; length: number } | null {
  const compactHay = haystack.replace(/\s+/g, '');
  const compactStart = compactHay.indexOf(compactNeedle);
  if (compactStart < 0) return null;

  let compactIndex = 0;
  let start = -1;
  let end = -1;

  for (let i = 0; i < haystack.length; i += 1) {
    if (/\s/.test(haystack[i])) continue;
    if (compactIndex === compactStart && start < 0) start = i;
    if (compactIndex === compactStart + compactNeedle.length - 1) {
      end = i + 1;
      break;
    }
    compactIndex += 1;
  }

  if (start < 0 || end < 0) return null;
  return { start, length: end - start };
}
