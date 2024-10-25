import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from './extension';
var constants = require('./constants');

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

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
        test("isPlatformAllowedByConfiguration return " + item.allowed + " for platform '" + item.platform + "' with target platform '" + item.targetPlatform + "'", () => {
            assert.equal(item.allowed, extension.isPlatformAllowedByConfiguration(item.platform, item.targetPlatform));
        });
    });
});
