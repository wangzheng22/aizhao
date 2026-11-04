import type { ParseStatus, ProjectForm } from '../../../types/documentWorkflow';
import { SidebarTip } from '../shared/SidebarTip';
import './ProjectInfoPanel.css';

type ProjectInfoPanelProps = {
  form: ProjectForm;
  parseStatus: ParseStatus;
  onChange: (form: ProjectForm) => void;
};

function RequiredLabel({ children }: { children: string }) {
  return (
    <label className="project-info__label">
      <span className="project-info__required" aria-hidden="true">*</span>
      {children}
    </label>
  );
}

type FieldLayout = 'default' | 'full' | 'span2';

function TextField({
  label,
  value,
  onChange,
  required = true,
  disabled = false,
  layout = 'default',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  layout?: FieldLayout;
}) {
  const layoutClass =
    layout === 'full'
      ? ' project-info__field--full'
      : layout === 'span2'
        ? ' project-info__field--span2'
        : '';

  return (
    <div className={`project-info__field${layoutClass}`}>
      {required ? <RequiredLabel>{label}</RequiredLabel> : <label className="project-info__label">{label}</label>}
      <input
        type="text"
        className="project-info__input"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="project-info__section-title">
      <span className="project-info__section-bar" aria-hidden="true" />
      {children}
    </h3>
  );
}

function ParsingState() {
  return (
    <div className="project-info__parsing" role="status" aria-live="polite">
      <div className="project-info__parsing-spinner" aria-hidden="true" />
      <p className="project-info__parsing-title">正在解析项目信息…</p>
      <p className="project-info__parsing-desc">AI 正在从上传文件中提取项目基本信息</p>
    </div>
  );
}

export function ProjectInfoPanel({ form, parseStatus, onChange }: ProjectInfoPanelProps) {
  const update = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => {
    onChange({ ...form, [key]: value });
  };

  const isParsing = parseStatus === 'parsing';
  const isDisabled = isParsing;

  return (
    <>
      <SidebarTip
        lines={
          isParsing
            ? ['正在从上传文件中提取项目信息，请稍候…']
            : ['检查项目信息，如有缺失可手动补充']
        }
      />

      {isParsing ? (
        <ParsingState />
      ) : (
        <div className="project-info project-info--grid">
          <SectionTitle>项目信息</SectionTitle>

          <TextField
            label="项目名称"
            value={form.projectName}
            disabled={isDisabled}
            onChange={(v) => update('projectName', v)}
            layout="full"
          />
          <TextField
            label="行业类型"
            value={form.industryType}
            disabled={isDisabled}
            onChange={(v) => update('industryType', v)}
          />
          <TextField
            label="专业类型"
            value={form.professionalType}
            disabled={isDisabled}
            onChange={(v) => update('professionalType', v)}
          />
          <TextField
            label="资金来源及比例"
            value={form.fundSourceAndRatio}
            disabled={isDisabled}
            onChange={(v) => update('fundSourceAndRatio', v)}
          />
          <TextField
            label="招标方式"
            value={form.biddingMethod}
            disabled={isDisabled}
            onChange={(v) => update('biddingMethod', v)}
          />
          <TextField
            label="建设地点"
            value={form.constructionLocation}
            disabled={isDisabled}
            onChange={(v) => update('constructionLocation', v)}
          />
          <TextField
            label="招标控制价"
            value={form.tenderControlPrice}
            disabled={isDisabled}
            onChange={(v) => update('tenderControlPrice', v)}
          />
          <TextField
            label="评标方法"
            value={form.bidEvaluationMethod}
            disabled={isDisabled}
            onChange={(v) => update('bidEvaluationMethod', v)}
            layout="span2"
          />
          <TextField
            label="资格审查方式"
            value={form.qualificationReviewMethod}
            disabled={isDisabled}
            onChange={(v) => update('qualificationReviewMethod', v)}
          />
        </div>
      )}
    </>
  );
}
