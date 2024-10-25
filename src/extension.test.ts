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
        { platform: "linux", targetPlatform: "Linux", allowed: true },
        { platform: "linux", targetPlatform: "All", allowed: true },
        { platform: "linux", targetPlatform: "non-platform", allowed: false },
        { platform: "osx", targetPlatform: "macOS", allowed: true },
        { platform: "osx", targetPlatform: "All", allowed: true },
        { platform: "osx", targetPlatform: "non-platform", allowed: false },
        { platform: "windows", targetPlatform: "Windows", allowed: true },
        { platform: "windows", targetPlatform: "All", allowed: true },
        { platform: "windows", targetPlatform: "non-platform", allowed: false },
        { platform: "shared", targetPlatform: "All", allowed: true },
        { platform: "shared", targetPlatform: "non-platform", allowed: true },
        { platform: "", targetPlatform: "", allowed: true }, // Default
    ].forEach(function (item) {
        test("isPlatformAllowedByConfiguration return " + item.allowed + " for platform '" + item.platform + " with target platform '" + item.targetPlatform + "'", () => {
            assert.equal(item.allowed, myExtension.isPlatformAllowedByConfiguration(item.platform, item.targetPlatform));
        });
    });
});
