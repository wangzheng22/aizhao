export type TocItem = {
  id: string;
  title: string;
  pageNumber: number;
  depth: number;
};

export const SAMPLE_PDF_URL = `${import.meta.env.BASE_URL}documents/sample-bidding-doc.pdf`;
