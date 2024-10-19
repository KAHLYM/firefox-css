import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from './extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    [
        { platform: "linux", descriptionPrefix: "Linux-specific Firefox CSS" },
        { platform: "osx", descriptionPrefix: "macOS-specific Firefox CSS" },
        { platform: "windows", descriptionPrefix: "Windows-specific Firefox CSS" },
        { platform: "non-platform", descriptionPrefix: "" },
    ].forEach(function (item) {
        test("getDesriptionPrefix return for '" + item.platform + "'", () => {
            assert.equal(item.descriptionPrefix, myExtension.getDesriptionPrefix(item.platform));
        });
    });
});
