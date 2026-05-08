import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Colored Areas Extension', () => {
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('colored-areas'));
  });

  test('Should activate', async () => {
    const ext = vscode.extensions.getExtension('colored-areas');
    if (!ext) {
      assert.fail('Extension not found');
      return;
    }
    await ext.activate();
    assert.ok(ext.isActive);
  });
});
