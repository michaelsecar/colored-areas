import { CommentStyle, LanguageOverride, PatternSet } from './types';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const LANGUAGE_MAP: Record<string, CommentStyle> = {
  javascript:       { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  typescript:       { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  javascriptreact:  { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  typescriptreact:  { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  c:                { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  cpp:              { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  csharp:           { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  java:             { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  python:           { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  ruby:             { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  php:              { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  go:               { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  rust:             { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  swift:            { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  kotlin:           { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  dart:             { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  scala:            { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  shellscript:      { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  powershell:       { lineComment: '#', blockCommentStart: '<#', blockCommentEnd: '#>' },
  sql:              { lineComment: '--', blockCommentStart: '/*', blockCommentEnd: '*/' },
  lua:              { lineComment: '--', blockCommentStart: '--[[', blockCommentEnd: ']]' },
  haskell:          { lineComment: '--', blockCommentStart: '{-', blockCommentEnd: '-}' },
  erlang:           { lineComment: '%', blockCommentStart: null, blockCommentEnd: null },
  r:                { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  yaml:             { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  toml:             { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  html:             { lineComment: null, blockCommentStart: '<!--', blockCommentEnd: '-->' },
  xml:              { lineComment: null, blockCommentStart: '<!--', blockCommentEnd: '-->' },
  markdown:         { lineComment: null, blockCommentStart: null, blockCommentEnd: null },
  css:              { lineComment: null, blockCommentStart: '/*', blockCommentEnd: '*/' },
  scss:             { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  less:             { lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/' },
  latex:            { lineComment: '%', blockCommentStart: null, blockCommentEnd: null },
  coffeescript:     { lineComment: '#', blockCommentStart: '###', blockCommentEnd: '###' },
  dockerfile:       { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  graphql:          { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  terraform:        { lineComment: '#', blockCommentStart: '/*', blockCommentEnd: '*/' },
  pascal:           { lineComment: '//', blockCommentStart: '{', blockCommentEnd: '}' },
  perl:             { lineComment: '#', blockCommentStart: null, blockCommentEnd: null },
  lisp:             { lineComment: ';', blockCommentStart: null, blockCommentEnd: null },
  bat:              { lineComment: 'REM', blockCommentStart: null, blockCommentEnd: null },
};

export function getCommentStyle(languageId: string): CommentStyle | null {
  return LANGUAGE_MAP[languageId] || null;
}

export function getEffectiveCommentStyle(
  languageId: string,
  override?: LanguageOverride
): CommentStyle | null {
  const base = getCommentStyle(languageId);

  if (!base && !override) return null;

  return {
    lineComment: override?.lineComment ?? base?.lineComment ?? null,
    blockCommentStart: override?.blockCommentStart ?? base?.blockCommentStart ?? null,
    blockCommentEnd: override?.blockCommentEnd ?? base?.blockCommentEnd ?? null,
  };
}

export function buildPatterns(
  commentStyle: CommentStyle,
  overrides?: LanguageOverride
): PatternSet | null {
  const startMarker = overrides?.regionStart || 'region:';
  const endMarker = overrides?.regionEnd || 'endregion';

  if (commentStyle.lineComment) {
    const esc = escapeRegex(commentStyle.lineComment.trim());
    return {
      startPattern: new RegExp(
        `^\\s*${esc}\\s*${escapeRegex(startMarker)}\\s*(.*)$`,
        'i'
      ),
      endPattern: new RegExp(
        `^\\s*${esc}\\s*${escapeRegex(endMarker)}\\s*$`,
        'i'
      ),
    };
  }

  if (commentStyle.blockCommentStart && commentStyle.blockCommentEnd) {
    const escStart = escapeRegex(commentStyle.blockCommentStart.trim());
    const escEnd = escapeRegex(commentStyle.blockCommentEnd.trim());
    return {
      startPattern: new RegExp(
        `^\\s*${escStart}\\s*${escapeRegex(startMarker)}\\s*(.*?)\\s*${escEnd}\\s*$`,
        'i'
      ),
      endPattern: new RegExp(
        `^\\s*${escStart}\\s*${escapeRegex(endMarker)}\\s*${escEnd}\\s*$`,
        'i'
      ),
    };
  }

  return null;
}
