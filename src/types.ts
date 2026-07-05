export interface ColoredAreaRegion {
  startLine: number;
  endLine: number;
  color: string;
  label: string;
  level: number;
  colorSource: 'inline' | 'palette';
  alpha?: number;
}

export interface CommentStyle {
  lineComment: string | null;
  blockCommentStart: string | null;
  blockCommentEnd: string | null;
}

export interface PatternSet {
  startPattern: RegExp;
  endPattern: RegExp;
}

export interface LanguageOverride {
  lineComment?: string;
  blockCommentStart?: string;
  blockCommentEnd?: string;
  regionStart?: string;
  regionEnd?: string;
}

export type RenderMode = 'full' | 'background' | 'gutter' | 'border';

export interface ColoredAreasConfig {
  enabled: boolean;
  renderMode: RenderMode;
  opacity: number;
  colors: string[];
  languageOverrides: Record<string, LanguageOverride>;
}
