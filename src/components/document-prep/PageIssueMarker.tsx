import type { FieldAnchor } from '../../types/completeness';
import { getIssueMarkerLabel } from '../../utils/markerLabels';
import './PageIssueMarker.css';

type MarkerIssue = {
  id: string;
  type: string;
  title: string;
  anchor?: FieldAnchor;
};

type PageIssueMarkerProps = {
  issue: MarkerIssue;
  active: boolean;
  top: number;
  markerClass?: string;
  onClick: (issue: MarkerIssue) => void;
};

export function PageIssueMarker({
  issue,
  active,
  top,
  markerClass,
  onClick,
}: PageIssueMarkerProps) {
  const label = getIssueMarkerLabel(issue);
  const typeClass =
    markerClass ??
    (issue.anchor?.category === 'smart-review'
      ? 'page-issue-marker--smart-review'
      : issue.anchor?.category === 'comment'
        ? 'page-issue-marker--comment'
        : 'page-issue-marker--completeness');

  return (
    <button
      type="button"
      data-page-marker-id={issue.id}
      className={[
        'page-issue-marker',
        typeClass,
        active ? 'page-issue-marker--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ top }}
      aria-label={`${issue.title}，点击查看详情`}
      aria-expanded={active}
      onClick={() => onClick(issue)}
    >
      <span className="page-issue-marker__label">{label}</span>
    </button>
  );
}
