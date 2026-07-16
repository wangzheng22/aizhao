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

function TextField({
  label,
  value,
  onChange,
  required = true,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="project-info__field">
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
        <div className="project-info">
          <SectionTitle>项目基本信息</SectionTitle>

          <TextField label="项目编号" value={form.projectCode} disabled={isDisabled} onChange={(v) => update('projectCode', v)} />
          <TextField label="项目名称" value={form.projectName} disabled={isDisabled} onChange={(v) => update('projectName', v)} />

          <div className="project-info__field">
            <RequiredLabel>项目需求</RequiredLabel>
            <textarea
              className="project-info__textarea"
              rows={4}
              value={form.projectRequirement}
              disabled={isDisabled}
              onChange={(e) => update('projectRequirement', e.target.value)}
            />
          </div>

          <TextField label="所属地区" value={form.region} disabled={isDisabled} onChange={(v) => update('region', v)} />

          <div className="project-info__field">
            <RequiredLabel>是否进场</RequiredLabel>
            <div className="project-info__radios">
              <label className="project-info__radio">
                <input
                  type="radio"
                  name="isEntry"
                  checked={form.isEntry === 'yes'}
                  disabled={isDisabled}
                  onChange={() => update('isEntry', 'yes')}
                />
                是
              </label>
              <label className="project-info__radio">
                <input
                  type="radio"
                  name="isEntry"
                  checked={form.isEntry === 'no'}
                  disabled={isDisabled}
                  onChange={() => update('isEntry', 'no')}
                />
                否
              </label>
            </div>
          </div>

          <TextField label="项目类型" value={form.projectType} disabled={isDisabled} onChange={(v) => update('projectType', v)} />
          <TextField label="招标方式" value={form.biddingMethod} disabled={isDisabled} onChange={(v) => update('biddingMethod', v)} />
          <TextField label="开标时间" value={form.bidOpenTime} disabled={isDisabled} onChange={(v) => update('bidOpenTime', v)} />

          <SectionTitle>招标人信息</SectionTitle>

          <TextField label="招标人" value={form.bidder} disabled={isDisabled} onChange={(v) => update('bidder', v)} />
          <TextField label="招标单位" value={form.biddingUnit} disabled={isDisabled} onChange={(v) => update('biddingUnit', v)} />
          <TextField label="联系方式" value={form.contact} disabled={isDisabled} onChange={(v) => update('contact', v)} />
          <TextField label="单位地址" value={form.address} disabled={isDisabled} onChange={(v) => update('address', v)} />
        </div>
      )}
    </>
  );
}
