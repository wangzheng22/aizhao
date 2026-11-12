import { useEffect, useRef } from 'react';
import type { ProjectUploadSectionId } from '../../../constants/projectUploadSections';
import { scrollSectionIntoContainer } from '../../../utils/scrollSectionIntoContainer';
import type {
  ParseStatus,
  ProjectForm,
  SectionParseStatusMap,
} from '../../../types/documentWorkflow';
import {
  PROJECT_FORM_SECTIONS,
  type ProjectFormFieldDef,
  type ProjectFormFieldKey,
  type ProjectFormSectionId,
} from '../../../data/projectFormSchema';
import { GENERAL_FORM_FIELD_KEYS } from '../../../utils/projectFormSectionFields';
import type { SectionParseStatus } from '../../../types/documentWorkflow';
import { SectionAiParsingState } from './SectionAiParsingState';
import './ProjectInfoPanel.css';

type ProjectInfoPanelProps = {
  form: ProjectForm;
  parseStatus: ParseStatus;
  sectionParseStatus?: SectionParseStatusMap;
  typingField?: { sectionId: ProjectFormSectionId; key: ProjectFormFieldKey } | null;
  onChange: (form: ProjectForm) => void;
  linkedSectionId?: ProjectUploadSectionId | null;
  anchorSectionId?: ProjectFormSectionId | null;
  onSectionHover?: (sectionId: ProjectUploadSectionId | null, source?: 'upload' | 'form') => void;
};

function deriveGeneralSectionStatus(
  form: ProjectForm,
  typingField: ProjectInfoPanelProps['typingField'],
): SectionParseStatus {
  if (typingField?.sectionId === 'general') return 'filling';
  const allFilled = GENERAL_FORM_FIELD_KEYS.every((key) => form[key].trim().length > 0);
  if (allFilled) return 'done';
  return 'idle';
}

const UNRECOGNIZED_PLACEHOLDER = '未识别，请手动填写';

function FormField({
  def,
  value,
  disabled,
  isTyping,
  markUnrecognized,
  onChange,
}: {
  def: ProjectFormFieldDef;
  value: string;
  disabled: boolean;
  isTyping?: boolean;
  markUnrecognized: boolean;
  onChange: (value: string) => void;
}) {
  const layout = def.layout ?? 'default';
  const layoutClass =
    layout === 'full'
      ? ' project-info__field--full'
      : layout === 'span2'
        ? ' project-info__field--span2'
        : '';

  const isUnrecognized = markUnrecognized && !value.trim();
  const fieldClass = [
    isUnrecognized ? ' project-info__field--unrecognized' : '',
    isTyping ? ' project-info__field--typing' : '',
  ].join('');
  const controlClass = [
    isUnrecognized ? ' project-info__control--unrecognized' : '',
    isTyping ? ' project-info__control--typing' : '',
  ].join('');

  const labelClass = isUnrecognized
    ? 'project-info__label project-info__label--unrecognized'
    : 'project-info__label';

  const labelNode = def.required ? (
    <label className={labelClass}>
      <span className="project-info__required" aria-hidden="true">
        *
      </span>
      {def.label}
      {isUnrecognized && (
        <span className="project-info__unrecognized-tag" aria-hidden="true">
          未识别
        </span>
      )}
    </label>
  ) : (
    <label className={labelClass}>
      {def.label}
      {isUnrecognized && (
        <span className="project-info__unrecognized-tag" aria-hidden="true">
          未识别
        </span>
      )}
    </label>
  );

  return (
    <div className={`project-info__field${layoutClass}${fieldClass}`}>
      {labelNode}
      {def.multiline ? (
        <textarea
          className={`project-info__textarea${controlClass}`}
          value={value}
          disabled={disabled}
          rows={3}
          placeholder={isUnrecognized ? UNRECOGNIZED_PLACEHOLDER : undefined}
          aria-invalid={isUnrecognized || undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={`project-info__input${controlClass}`}
          value={value}
          disabled={disabled}
          placeholder={isUnrecognized ? UNRECOGNIZED_PLACEHOLDER : undefined}
          aria-invalid={isUnrecognized || undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function SectionTitle({
  children,
  showDone,
}: {
  children: string;
  showDone?: boolean;
}) {
  return (
    <h3 className="project-info__section-title">
      {showDone ? (
        <span className="project-info__section-done" aria-hidden="true" title="本分区已识别完成">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#b7eb8f" strokeWidth="1.2" fill="#f6ffed" />
            <path
              d="M4.5 8.2 7.1 10.7 11.5 5.3"
              stroke="#52c41a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <span className="project-info__section-bar" aria-hidden="true" />
      )}
      {children}
    </h3>
  );
}

export function ProjectInfoPanel({
  form,
  parseStatus,
  sectionParseStatus,
  typingField = null,
  onChange,
  linkedSectionId = null,
  anchorSectionId = null,
  onSectionHover,
}: ProjectInfoPanelProps) {
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorSectionId || !cardsScrollRef.current) return;
    const target = cardsScrollRef.current.querySelector<HTMLElement>(
      `[data-form-section="${anchorSectionId}"]`,
    );
    if (!target) return;
    scrollSectionIntoContainer(cardsScrollRef.current, target);
  }, [anchorSectionId]);

  const update = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => {
    onChange({ ...form, [key]: value });
  };

  const anySectionParsed = sectionParseStatus
    ? Object.values(sectionParseStatus).some((status) => status === 'done')
    : parseStatus === 'done';

  return (
    <>
      <div ref={cardsScrollRef} className="project-info project-info--cards">
        {PROJECT_FORM_SECTIONS.map((section) => {
          const uploadSectionId =
            section.id === 'general' ? null : (section.id as ProjectUploadSectionId);
          const participatesInUploadLink = uploadSectionId != null;

          const sectionStatus =
            section.id === 'general'
              ? deriveGeneralSectionStatus(form, typingField)
              : (sectionParseStatus?.[uploadSectionId!] ?? 'idle');
          const isSectionParsing = sectionStatus === 'parsing';
          const isSectionFilling = sectionStatus === 'filling';
          const showSectionDone = sectionStatus === 'done' && !isSectionParsing && !isSectionFilling;
          const markSectionUnrecognized =
            !isSectionParsing &&
            !isSectionFilling &&
            (section.id === 'general'
              ? anySectionParsed
              : sectionParseStatus != null
                ? sectionStatus === 'done' || (sectionStatus === 'idle' && anySectionParsed)
                : parseStatus === 'done');

          const isLinked = participatesInUploadLink && linkedSectionId === uploadSectionId;
          const isDimmed =
            participatesInUploadLink && linkedSectionId != null && !isLinked;

          return (
            <article
              key={section.id}
              className={[
                'project-info__section-card',
                isSectionParsing ? 'project-info__section-card--parsing' : '',
                isSectionFilling ? 'project-info__section-card--filling' : '',
                isLinked ? 'project-info__section-card--linked' : '',
                isDimmed ? 'project-info__section-card--dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              id={`project-form-section-${section.id}`}
              data-form-section={section.id}
              onMouseEnter={() => {
                if (uploadSectionId) onSectionHover?.(uploadSectionId, 'form');
              }}
              onMouseLeave={() => onSectionHover?.(null)}
            >
              <SectionTitle showDone={showSectionDone}>{section.title}</SectionTitle>

              {isSectionParsing ? (
                <SectionAiParsingState sectionTitle={section.title} />
              ) : (
                <div className="project-info__section-grid">
                  {section.fields.map((fieldDef) => (
                    <FormField
                      key={fieldDef.key}
                      def={fieldDef}
                      value={form[fieldDef.key]}
                      disabled={isSectionFilling}
                      isTyping={
                        isSectionFilling &&
                        typingField?.sectionId === section.id &&
                        typingField.key === fieldDef.key
                      }
                      markUnrecognized={markSectionUnrecognized}
                      onChange={(value) => update(fieldDef.key, value)}
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
