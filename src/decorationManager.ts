import * as vscode from 'vscode';
import { ColoredAreaRegion, ColoredAreasConfig, RenderMode } from './types';

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  let r: number;
  let g: number;
  let b: number;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  } else {
    return hex;
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function createDecorationType(
  color: string,
  opacity: number,
  mode: RenderMode,
): vscode.TextEditorDecorationType {
  const rgba = hexToRgba(color, opacity);
  const options: vscode.DecorationRenderOptions = {
    isWholeLine: true,
    rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
  };

  switch (mode) {
    case 'full':
      options.backgroundColor = rgba;
      options.borderWidth = '0 0 0 3px';
      options.borderStyle = 'solid';
      options.borderColor = color;
      break;
    case 'background':
      options.backgroundColor = rgba;
      break;
    case 'gutter':
      options.borderWidth = '0 0 0 3px';
      options.borderStyle = 'solid';
      options.borderColor = color;
      break;
    case 'border':
      options.borderWidth = '0 0 0 3px';
      options.borderStyle = 'solid';
      options.borderColor = color;
      break;
  }

  return vscode.window.createTextEditorDecorationType(options);
}

export class DecorationManager {
  private cache = new Map<string, vscode.TextEditorDecorationType>();

  private cacheKey(color: string, opacity: number, mode: RenderMode): string {
    return `${color}|${opacity}|${mode}`;
  }

  private getOrCreate(
    color: string,
    opacity: number,
    mode: RenderMode,
  ): vscode.TextEditorDecorationType {
    const key = this.cacheKey(color, opacity, mode);
    let dt = this.cache.get(key);
    if (!dt) {
      dt = createDecorationType(color, opacity, mode);
      this.cache.set(key, dt);
    }
    return dt;
  }

  apply(
    editor: vscode.TextEditor,
    regions: ColoredAreaRegion[],
    config: ColoredAreasConfig,
  ): void {
    const activeKeys = new Set<string>();

    const grouped = new Map<string, vscode.Range[]>();
    for (const region of regions) {
      const key = this.cacheKey(region.color, config.opacity, config.renderMode);
      activeKeys.add(key);

      let ranges = grouped.get(region.color);
      if (!ranges) {
        ranges = [];
        grouped.set(region.color, ranges);
      }
      ranges.push(new vscode.Range(region.startLine, 0, region.endLine, 0));
    }

    for (const [color, ranges] of grouped) {
      const dt = this.getOrCreate(color, config.opacity, config.renderMode);
      editor.setDecorations(dt, ranges);
    }

    for (const [key, dt] of this.cache) {
      if (!activeKeys.has(key)) {
        editor.setDecorations(dt, []);
      }
    }
  }

  clearAll(editor: vscode.TextEditor): void {
    for (const dt of this.cache.values()) {
      editor.setDecorations(dt, []);
    }
  }

  clearCache(): void {
    for (const dt of this.cache.values()) {
      dt.dispose();
    }
    this.cache.clear();
  }

  dispose(): void {
    this.clearCache();
  }
}
