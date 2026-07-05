import * as vscode from 'vscode';
import { ColoredAreasConfig, LanguageOverride, RenderMode } from './types';

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function loadConfig(): ColoredAreasConfig {
  const config = vscode.workspace.getConfiguration('coloredAreas');

  const enabled = config.get<boolean>('enabled', true);
  const renderMode = config.get<RenderMode>('renderMode', 'full');
  const rawOpacity = config.get<number>('opacity', 0.2);
  const opacity = Math.max(0, Math.min(1, rawOpacity));
  const colors = config.get<string[]>('colors', DEFAULT_COLORS);
  const languageOverrides = config.get<Record<string, LanguageOverride>>('languageOverrides', {});

  return { enabled, renderMode, opacity, colors, languageOverrides };
}
