export const STORAGE_KEY = "omnieditor-content";
export const STYLE_STORAGE_KEY = "omnieditor-style";
export const DOCS_STORAGE_KEY = "omnieditor-documents";
export const CONTENT_THEME_STORAGE_KEY = "omnieditor-content-theme";

export type SavedDocument = {
  name: string;
  slug: string;
  content: string;
  updatedAt: string;
};
