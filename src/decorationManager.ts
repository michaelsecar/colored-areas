import * as vscode from 'vscode';
import { ColoredAreaRegion, ColoredAreasConfig, RenderMode } from './types';

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  let r: number;
  let g: number;
  let b: number;
  let a: number = opacity;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 4) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
    a = parseInt(clean[3] + clean[3], 16) / 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
    if (clean.length === 8) {
      a = parseInt(clean.slice(6, 8), 16) / 255;
    }
  } else {
    return hex;
  }

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function createDecorationType(
  color: string,
  opacity: number,
  mode: RenderMode,
  regionAlpha?: number,
): vscode.TextEditorDecorationType {
  const effectiveOpacity = regionAlpha !== undefined ? regionAlpha : opacity;
  const rgba = hexToRgba(color, effectiveOpacity);
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

  private cacheKey(color: string, opacity: number, mode: RenderMode, regionAlpha?: number): string {
    const alpha = regionAlpha !== undefined ? regionAlpha : opacity;
    return `${color}|${alpha}|${mode}`;
  }

  private getOrCreate(
    color: string,
    opacity: number,
    mode: RenderMode,
    regionAlpha?: number,
  ): vscode.TextEditorDecorationType {
    const key = this.cacheKey(color, opacity, mode, regionAlpha);
    let dt = this.cache.get(key);
    if (!dt) {
      dt = createDecorationType(color, opacity, mode, regionAlpha);
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

    type GroupEntry = { ranges: vscode.Range[]; color: string; alpha: number };
    const grouped = new Map<string, GroupEntry>();
    for (const region of regions) {
      const effectiveAlpha = region.alpha !== undefined ? region.alpha : config.opacity;
      const groupKey = `${region.color}|${effectiveAlpha}`;
      const cacheKey = this.cacheKey(region.color, config.opacity, config.renderMode, effectiveAlpha);
      activeKeys.add(cacheKey);

      let entry = grouped.get(groupKey);
      if (!entry) {
        entry = { ranges: [], color: region.color, alpha: effectiveAlpha };
        grouped.set(groupKey, entry);
      }
      entry.ranges.push(new vscode.Range(region.startLine, 0, region.endLine, 0));
    }

    for (const [, entry] of grouped) {
      const dt = this.getOrCreate(entry.color, config.opacity, config.renderMode, entry.alpha);
      editor.setDecorations(dt, entry.ranges);
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
