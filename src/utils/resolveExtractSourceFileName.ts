import { PROJECT_TITLE } from '../constants/documentPrep';
import { PROJECT_UPLOAD_SECTION_ORDER } from '../constants/projectUploadSections';
import type { UploadFiles } from '../types/documentWorkflow';

/** 编审清单「上传文件抽提」来源展示用的文件名 */
export function resolveExtractSourceFileName(
  uploadFiles: UploadFiles,
  projectName?: string,
): string {
  for (const sectionId of PROJECT_UPLOAD_SECTION_ORDER) {
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
