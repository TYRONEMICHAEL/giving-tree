export type Markdown = string;

export interface Store {
  add: (markdown: Markdown) => Promise<void>
  query: (query: string) => Promise<string>
};
