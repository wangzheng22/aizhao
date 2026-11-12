import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  PROJECT_UPLOAD_SECTION_ORDER,
  type ProjectUploadSectionId,
} from '../constants/projectUploadSections';
import type { ProjectFormFieldKey, ProjectFormSectionId } from '../data/projectFormSchema';
import type { ParseStatus, ProjectForm, SectionParseStatusMap, UploadFiles } from '../types/documentWorkflow';
import { emptyProjectForm } from '../types/documentWorkflow';
import { clearSectionFormFields } from '../utils/projectFormSectionFields';
import { runSectionTypewriterFill } from '../utils/runSectionTypewriterFill';

const SECTION_PARSE_MS = 4800;

function createIdleSectionStatus(): SectionParseStatusMap {
  return {
    earlyApproval: 'idle',
    tenderEntity: 'idle',
    other: 'idle',
  };
}

function sectionFilesKey(files: UploadFiles, sectionId: ProjectUploadSectionId) {
  return JSON.stringify(files[sectionId] ?? []);
}

function deriveGlobalParseStatus(map: SectionParseStatusMap): ParseStatus {
  const values = Object.values(map);
  if (values.some((status) => status === 'parsing' || status === 'filling')) {
    return 'parsing';
  }
  if (values.some((status) => status === 'done')) return 'done';
  return 'idle';
}

function canGenerateDocument(files: UploadFiles, map: SectionParseStatusMap) {
  if (!PROJECT_UPLOAD_SECTION_ORDER.some((id) => (files[id]?.length ?? 0) > 0)) {
    return false;
  }
  if (Object.values(map).some((status) => status === 'parsing' || status === 'filling')) {
    return false;
  }
  return PROJECT_UPLOAD_SECTION_ORDER.every((id) => {
    if ((files[id]?.length ?? 0) === 0) return true;
    return map[id] === 'done';
  });
}

type UseSectionUploadParsingOptions = {
  embedded?: boolean;
};

export function useSectionUploadParsing(
  uploadFiles: UploadFiles,
  projectForm: ProjectForm,
  onProjectFormChange: Dispatch<SetStateAction<ProjectForm>>,
  options: UseSectionUploadParsingOptions = {},
) {
  const { embedded = false } = options;
  const [sectionParseStatus, setSectionParseStatus] =
    useState<SectionParseStatusMap>(createIdleSectionStatus);
  const sectionKeysRef = useRef<Record<ProjectUploadSectionId, string>>(
    {} as Record<ProjectUploadSectionId, string>,
  );
  const sectionTimersRef = useRef<Partial<Record<ProjectUploadSectionId, number>>>({});
  const typewriterCancelRef = useRef<Partial<Record<ProjectUploadSectionId, () => void>>>({});
  const mountHandledRef = useRef(false);
  const [typingField, setTypingField] = useState<{
    sectionId: ProjectFormSectionId;
    key: ProjectFormFieldKey;
  } | null>(null);

  useEffect(() => {
    const clearParseTimer = (sectionId: ProjectUploadSectionId) => {
      const timerId = sectionTimersRef.current[sectionId];
      if (timerId != null) {
        window.clearTimeout(timerId);
        delete sectionTimersRef.current[sectionId];
      }
    };

    const clearTypewriter = (sectionId: ProjectUploadSectionId) => {
      typewriterCancelRef.current[sectionId]?.();
      delete typewriterCancelRef.current[sectionId];
    };

    const startTypewriterFill = (sectionId: ProjectUploadSectionId) => {
      clearTypewriter(sectionId);
      setTypingField(null);
      setSectionParseStatus((prev) => ({ ...prev, [sectionId]: 'filling' }));

      typewriterCancelRef.current[sectionId] = runSectionTypewriterFill(
        sectionId,
        onProjectFormChange,
        () => {
          setTypingField(null);
          setSectionParseStatus((prev) => ({ ...prev, [sectionId]: 'done' }));
          delete typewriterCancelRef.current[sectionId];
        },
        {
          onFieldStart: (key, formSectionId) =>
            setTypingField({ sectionId: formSectionId, key }),
          onFieldEnd: (key, formSectionId) =>
            setTypingField((current) =>
              current?.sectionId === formSectionId && current.key === key ? null : current,
            ),
        },
      );
    };

    const startSectionParse = (sectionId: ProjectUploadSectionId) => {
      clearParseTimer(sectionId);
      clearTypewriter(sectionId);
      setSectionParseStatus((prev) => ({ ...prev, [sectionId]: 'parsing' }));
      onProjectFormChange((current) => clearSectionFormFields(current, sectionId));

      sectionTimersRef.current[sectionId] = window.setTimeout(() => {
        delete sectionTimersRef.current[sectionId];
        startTypewriterFill(sectionId);
      }, SECTION_PARSE_MS);
    };

    if (!mountHandledRef.current) {
      mountHandledRef.current = true;
      PROJECT_UPLOAD_SECTION_ORDER.forEach((sectionId) => {
        sectionKeysRef.current[sectionId] = sectionFilesKey(uploadFiles, sectionId);
      });

      if (embedded && projectForm.projectName.trim()) {
        const nextStatus = createIdleSectionStatus();
        PROJECT_UPLOAD_SECTION_ORDER.forEach((sectionId) => {
          if ((uploadFiles[sectionId]?.length ?? 0) > 0) {
            nextStatus[sectionId] = 'done';
          }
        });
        setSectionParseStatus(nextStatus);
        return;
      }
    }

    const hasAnyFiles = PROJECT_UPLOAD_SECTION_ORDER.some(
      (sectionId) => (uploadFiles[sectionId]?.length ?? 0) > 0,
    );

    if (!hasAnyFiles) {
      PROJECT_UPLOAD_SECTION_ORDER.forEach((sectionId) => {
        clearParseTimer(sectionId);
        clearTypewriter(sectionId);
        sectionKeysRef.current[sectionId] = sectionFilesKey(uploadFiles, sectionId);
      });
      setSectionParseStatus(createIdleSectionStatus());
      onProjectFormChange(emptyProjectForm);
      return;
    }

    PROJECT_UPLOAD_SECTION_ORDER.forEach((sectionId) => {
      const nextKey = sectionFilesKey(uploadFiles, sectionId);
      const prevKey = sectionKeysRef.current[sectionId];
      if (nextKey === prevKey) return;

      sectionKeysRef.current[sectionId] = nextKey;
      const hasFiles = (uploadFiles[sectionId]?.length ?? 0) > 0;

      if (!hasFiles) {
        clearParseTimer(sectionId);
        clearTypewriter(sectionId);
        setSectionParseStatus((prev) => ({ ...prev, [sectionId]: 'idle' }));
        onProjectFormChange((current) => clearSectionFormFields(current, sectionId));
        return;
      }

      startSectionParse(sectionId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 按分区 diff 触发解析
  }, [uploadFiles, embedded, projectForm.projectName]);

  useEffect(
    () => () => {
      PROJECT_UPLOAD_SECTION_ORDER.forEach((sectionId) => {
        const timerId = sectionTimersRef.current[sectionId];
        if (timerId != null) window.clearTimeout(timerId);
        typewriterCancelRef.current[sectionId]?.();
      });
    },
    [],
  );

  const parseStatus = deriveGlobalParseStatus(sectionParseStatus);
  const generateReady = canGenerateDocument(uploadFiles, sectionParseStatus);

  return { sectionParseStatus, parseStatus, generateReady, typingField };
}
