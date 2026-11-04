import { PROJECT_TITLE } from '../constants/documentPrep';
import type { UploadFiles } from '../types/documentWorkflow';

const UPLOAD_SECTION_ORDER = ['approval', 'quantities', 'drawings', 'other'] as const;

/** 编审清单「上传文件抽提」来源展示用的文件名 */
export function resolveExtractSourceFileName(
  uploadFiles: UploadFiles,
  projectName?: string,
): string {
  for (const sectionId of UPLOAD_SECTION_ORDER) {
    const name = uploadFiles[sectionId]?.[0]?.trim();
    if (name) return name;
  }

  const fallbackUploaded = Object.values(uploadFiles)
    .flat()
    .map((name) => name.trim())
    .find(Boolean);
  if (fallbackUploaded) return fallbackUploaded;

  const base = projectName?.trim() || PROJECT_TITLE.replace(/招标文件$/, '').trim();
  return `${base}招标文件.pdf`;
}
