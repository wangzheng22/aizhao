export type ReviewBasisArticle = {
  /** e.g. 第二十四条 */
  no: string;
  text: string;
};

export type ReviewBasis = {
  id: string;
  /** Short label shown in the chip, e.g. 《民法典》第265条 */
  label: string;
  /** Optional secondary title in the detail modal */
  title?: string;
  /** Full basis detail / summary shown in the popup */
  detail: string;
  /** Issuing authority / legal hierarchy, e.g. 法律 · 全国人大常委会 */
  source?: string;
  /** Effective / revised date for mock display */
  effectiveDate?: string;
  /** Structured article excerpts */
  articles?: ReviewBasisArticle[];
  /** How this basis applies to the current issue */
  applyNote?: string;
  /** Related mock cases or practice notes */
  relatedCases?: string[];
};

export type ReviewCardTone = 'missing' | 'issue';
