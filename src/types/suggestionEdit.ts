export type SuggestionEditHandlers = {
  getSuggestionText: (issueId: string, original: string) => string;
  isManualSuggestion: (issueId: string, original: string) => boolean;
  onSuggestionSave: (issueId: string, original: string, value: string) => void;
};
