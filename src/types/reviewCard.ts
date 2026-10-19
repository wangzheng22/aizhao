export type ReviewBasis = {
  id: string;
  /** Short label shown in the chip, e.g. 《民法典》第265条 */
  label: string;
  /** Optional secondary title in the detail modal */
  title?: string;
  /** Full basis detail shown in the popup */
  detail: string;
};

export type ReviewCardTone = 'missing' | 'issue';
