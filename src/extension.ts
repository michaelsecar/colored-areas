import * as vscode from 'vscode';
import { loadConfig } from './config';
import { getEffectiveCommentStyle, buildPatterns } from './languageSupport';
import { parseRegions } from './regionParser';
import { DecorationManager } from './decorationManager';

let decorationManager: DecorationManager | undefined;

class ColoredAreasColorProvider implements vscode.DocumentColorProvider {
  provideDocumentColors(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.ColorInformation[] {
    const results: vscode.ColorInformation[] = [];
    const langId = document.languageId;
    const config = loadConfig();
    const override = config.languageOverrides[langId];
    const commentStyle = getEffectiveCommentStyle(langId, override);
    if (!commentStyle) return results;

    const patterns = buildPatterns(commentStyle, override);
    if (!patterns) return results;

    const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;
    const totalLines = document.lineCount;

    for (let i = 0; i < totalLines; i++) {
      const text = document.lineAt(i).text;
      if (!patterns.startPattern.test(text)) continue;

      hexRegex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = hexRegex.exec(text)) !== null) {
        const color = this.hexToColor(m[0]);
        if (!color) continue;

        const startPos = new vscode.Position(i, m.index);
        const endPos = new vscode.Position(i, m.index + m[0].length);
        results.push(
          new vscode.ColorInformation(new vscode.Range(startPos, endPos), color),
        );
      }
    }

    return results;
  }

  provideColorPresentations(
    color: vscode.Color,
    _context: { readonly document: vscode.TextDocument; readonly range: vscode.Range },
    _token: vscode.CancellationToken,
  ): vscode.ColorPresentation[] {
    const toHex = (n: number) => {
      const h = Math.round(n * 255).toString(16);
      return h.length === 1 ? '0' + h : h;
    };
    let hex = `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
    if (color.alpha < 1) {
      hex += toHex(color.alpha);
    }
    return [new vscode.ColorPresentation(hex)];
  }

  private hexToColor(hex: string): vscode.Color | null {
    const toFloat = (s: string) => parseInt(s, 16) / 255;
    const h = hex.replace('#', '');

    if (h.length === 3) {
      return new vscode.Color(
        toFloat(h[0] + h[0]),
        toFloat(h[1] + h[1]),
        toFloat(h[2] + h[2]),
        1,
      );
    }
    if (h.length === 4) {
      return new vscode.Color(
        toFloat(h[0] + h[0]),
        toFloat(h[1] + h[1]),
        toFloat(h[2] + h[2]),
        toFloat(h[3] + h[3]),
      );
    }
    if (h.length === 6) {
      return new vscode.Color(
        toFloat(h.slice(0, 2)),
        toFloat(h.slice(2, 4)),
        toFloat(h.slice(4, 6)),
        1,
      );
    }
    if (h.length === 8) {
      return new vscode.Color(
        toFloat(h.slice(0, 2)),
        toFloat(h.slice(2, 4)),
        toFloat(h.slice(4, 6)),
        toFloat(h.slice(6, 8)),
      );
    }
    return null;
  }
}

class RegionFoldingProvider implements vscode.FoldingRangeProvider {
  async provideFoldingRanges(
    document: vscode.TextDocument,
    _context: vscode.FoldingContext,
    _token: vscode.CancellationToken,
  ): Promise<vscode.FoldingRange[]> {
    const config = loadConfig();
    if (!config.enabled) return [];

    const langId = document.languageId;
    const override = config.languageOverrides[langId];
    const commentStyle = getEffectiveCommentStyle(langId, override);
    if (!commentStyle) return [];

    const patterns = buildPatterns(commentStyle, override);
    if (!patterns) return [];

    const regions = parseRegions(document, patterns, config.colors);

    return regions.map(
      (r) => new vscode.FoldingRange(r.startLine, r.endLine, vscode.FoldingRangeKind.Region),
    );
  }
}

export function activate(context: vscode.ExtensionContext): void {
  decorationManager = new DecorationManager();
  let throttleTimer: NodeJS.Timeout | undefined;

  function updateDecorations(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const config = loadConfig();
    if (!config.enabled) {
      decorationManager?.clearAll(editor);
      return;
    }

    const langId = editor.document.languageId;
    const override = config.languageOverrides[langId];
    const commentStyle = getEffectiveCommentStyle(langId, override);
    if (!commentStyle) {
      decorationManager?.clearAll(editor);
      return;
    }

    const patterns = buildPatterns(commentStyle, override);
    if (!patterns) {
      decorationManager?.clearAll(editor);
      return;
    }

    const regions = parseRegions(editor.document, patterns, config.colors);
    decorationManager!.apply(editor, regions, config);
  }

  function triggerUpdate(throttle = true): void {
    if (throttleTimer) clearTimeout(throttleTimer);
    if (throttle) {
      throttleTimer = setTimeout(() => updateDecorations(), 300);
    } else {
      updateDecorations();
    }
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => triggerUpdate(false)),
    vscode.workspace.onDidChangeTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && e.document === editor.document) {
        triggerUpdate(true);
      }
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('coloredAreas')) {
        decorationManager?.clearCache();
        triggerUpdate(false);
      }
    }),
    vscode.commands.registerCommand('coloredAreas.toggle', () => {
      const config = vscode.workspace.getConfiguration('coloredAreas');
      const current = config.get<boolean>('enabled', true);
      config.update('enabled', !current, vscode.ConfigurationTarget.Global);
    }),
  );

  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      { scheme: 'file' },
      new RegionFoldingProvider(),
    ),
    vscode.languages.registerColorProvider(
      { scheme: 'file' },
      new ColoredAreasColorProvider(),
    ),
  );

  triggerUpdate(false);
}

export function deactivate(): void {
  decorationManager?.dispose();
  decorationManager = undefined;
}
