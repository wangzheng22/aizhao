import type { Dispatch, SetStateAction } from 'react';
import type { ProjectUploadSectionId } from '../constants/projectUploadSections';
import { PROJECT_FORM_EXTRACTIONS } from '../data/projectFormExtractions';
import {
  PROJECT_FORM_SECTIONS,
  type ProjectFormFieldKey,
  type ProjectFormSectionId,
} from '../data/projectFormSchema';
import type { ProjectForm } from '../types/documentWorkflow';
import { GENERAL_FIELDS_BY_UPLOAD_SECTION } from './projectFormSectionFields';

const CHAR_MS = 36;
const FIELD_GAP_MS = 160;

type FillEntry = {
  key: ProjectFormFieldKey;
  full: string;
  formSectionId: ProjectFormSectionId;
};

/** 识别完成后按字段顺序逐个打字机填充（含从本分材料写入「通用」的字段） */
type TypewriterCallbacks = {
  onFieldStart?: (key: ProjectFormFieldKey, formSectionId: ProjectFormSectionId) => void;
  onFieldEnd?: (key: ProjectFormFieldKey, formSectionId: ProjectFormSectionId) => void;
};

export function runSectionTypewriterFill(
  uploadSectionId: ProjectUploadSectionId,
  onProjectFormChange: Dispatch<SetStateAction<ProjectForm>>,
  onComplete: () => void,
  callbacks: TypewriterCallbacks = {},
): () => void {
  const section = PROJECT_FORM_SECTIONS.find((item) => item.id === uploadSectionId);
  const target = PROJECT_FORM_EXTRACTIONS[uploadSectionId];
  if (!section || !target) {
    onComplete();
    return () => {};
  }

  const timers: number[] = [];
  let cancelled = false;

  const generalKeys = GENERAL_FIELDS_BY_UPLOAD_SECTION[uploadSectionId] ?? [];
  const generalEntries: FillEntry[] = generalKeys
    .map((key) => ({
      key,
      full: (target[key] ?? '').toString(),
      formSectionId: 'general' as const,
    }))
    .filter((item) => item.full.length > 0);

  const sectionEntries: FillEntry[] = section.fields
    .map((field) => ({
      key: field.key as ProjectFormFieldKey,
      full: (target[field.key] ?? '').toString(),
      formSectionId: uploadSectionId,
    }))
    .filter((item) => item.full.length > 0);

  const entries = [...generalEntries, ...sectionEntries];

  if (entries.length === 0) {
    onComplete();
    return () => {};
  }

  let scheduleAt = 0;

  entries.forEach(({ key, full, formSectionId }, fieldIndex) => {
    if (fieldIndex > 0) {
      scheduleAt += FIELD_GAP_MS;
    }

    const fieldStartAt = scheduleAt + CHAR_MS;
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        callbacks.onFieldStart?.(key, formSectionId);
      }, fieldStartAt),
    );

    for (let index = 1; index <= full.length; index += 1) {
      scheduleAt += CHAR_MS;
      const at = scheduleAt;
      const slice = full.slice(0, index);
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          onProjectFormChange((prev) => ({ ...prev, [key]: slice }));
        }, at),
      );
    }

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        callbacks.onFieldEnd?.(key, formSectionId);
      }, scheduleAt),
    );
  });

  timers.push(
    window.setTimeout(() => {
      if (!cancelled) onComplete();
    }, scheduleAt + 48),
  );

  return () => {
    cancelled = true;
    timers.forEach((timerId) => window.clearTimeout(timerId));
  };
}
