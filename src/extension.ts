import * as vscode from 'vscode';
import fs from "fs";
import { spawn_, spawnSync_ } from './child_process';
import { completions, downloadCompletions } from './completions';

const CONFIGURATION_SECTION = "firefoxCSS";

export const output = vscode.window.createOutputChannel("Firefox CSS");

export function isPlatformAllowedByConfiguration(platform: string, targetPlatform_: string = ""): boolean {
	const targetPlatform = targetPlatform_ ? targetPlatform_ : vscode.workspace.getConfiguration(CONFIGURATION_SECTION).get<string>('targetPlatform');
	switch (platform) {
		case "linux":
			if (!["All", "Linux"].includes(targetPlatform!)) {
				return false;
			}
			break;
		case "osx":
			if (!["All", "macOS"].includes(targetPlatform!)) {
				return false;
			}
			break;
		case "windows":
			if (!["All", "Windows"].includes(targetPlatform!)) {
				return false;
			}
			break;
		default:
			break;
	}

	return true;
}

export function getDesriptionPrefix(platform: string): string {
	const postfix: string = "-specific Firefox CSS\n";
	switch (platform) {
		case "linux":
			return `Linux${postfix}`;
		case "osx":
			return `macOS${postfix}`;
		case "windows":
			return `Windows${postfix}`;
		default:
			return "";
	}
}

/* istanbul ignore next: Platform dependant */
export function getFirefoxExectuableLocation(): string | null {
	const path = vscode.workspace.getConfiguration(CONFIGURATION_SECTION).get<string>('launch.path');
	if (path && fs.existsSync(path)) {
		return path;
	}

	switch (process.platform) {
		case "aix":
		case "android":
		case "darwin": // macOS
		case "freebsd":
		case "linux":
		case "openbsd":
		case "sunos":
			return null;
		case "win32": // Windows
			return `${process.env.PROGRAMFILES}\\Mozilla Firefox\\firefox.exe`;
		default:
			return null;
	}
}

/* istanbul ignore next: Platform dependant */
export function closeExistingFirefoxExecutables(): void {
	switch (process.platform) {
		case "aix":
		case "android":
		case "darwin": // macOS
		case "freebsd":
		case "linux":
		case "openbsd":
		case "sunos":
			return;
		case "win32": // Windows
			spawnSync_("taskkill", ["/F", "/IM", "firefox.exe"]);
		default:
			return;
	}
}

export function openFirefoxExecutable(): void {
	const firefoxExecutableLocation = getFirefoxExectuableLocation();
	if (firefoxExecutableLocation) {
		spawn_(`${firefoxExecutableLocation}`);
	} else {
		vscode.window.showWarningMessage("Could not find Firefox executable location.");
	}
}

/* istanbul ignore next: Difficult to unit test */
export async function activate(context: vscode.ExtensionContext) {

	await downloadCompletions(vscode.workspace.getConfiguration(CONFIGURATION_SECTION).get<string>('source')!);

	const completion = vscode.languages.registerCompletionItemProvider({ pattern: '**/userChrome.css' }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			let completionItems: vscode.CompletionItem[] = [];

			for (const [platform, values] of Object.entries(completions.completions)) {

				if (!isPlatformAllowedByConfiguration(platform)) {
					continue;
				}

				// @ts-ignore: TS2488
				for (const element of values) {
					const completion = new vscode.CompletionItem({ label: element.label!, description: `Firefox CSS` }, vscode.CompletionItemKind.Snippet);
					completion.documentation = new vscode.MarkdownString(`\`\`\`css\n${element.snippet!}\n\`\`\`\n\nSource: ${element.source}`);
					completion.insertText = new vscode.SnippetString(element.snippet!);
					completionItems.push(completion);
				};
			};

			return completionItems;
		}
	});

	const launch = vscode.commands.registerCommand('firefox-css.launch', () => {
		if (vscode.workspace.getConfiguration(CONFIGURATION_SECTION).get<boolean>('launch.closeExisting')) {
			closeExistingFirefoxExecutables();
		}

		openFirefoxExecutable();
	});

	context.subscriptions.push(completion, launch);

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (vscode.workspace.getConfiguration(CONFIGURATION_SECTION).get<boolean>('launch.onSave')) {
			if (document.fileName.endsWith("userChrome.css")) {
				vscode.commands.executeCommand("firefox-css.launch");
			}
		}
	});
}

/* istanbul ignore next: Empty function */
export function deactivate() { }
