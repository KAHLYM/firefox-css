import * as vscode from 'vscode';
import json from '../completions.json';
import { spawn } from 'node:child_process';
import fs from "fs";

let output = vscode.window.createOutputChannel("Firefox CSS");

export function isPlatformAllowedByConfiguration(platform: string, targetPlatform_: string = ""): boolean {
	const targetPlatform = targetPlatform_ ? targetPlatform_ : vscode.workspace.getConfiguration('firefoxCSS').get<string>('targetPlatform');
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
	const path = vscode.workspace.getConfiguration('firefoxCSS').get<string>('launch.path');
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

export function spawn_(command: string, args?: readonly string[],): void {
	const process = spawn(command, args);

	process.stderr.on("data", (data) => {
		output.appendLine(`Launching ${command} failed with stderr: ${data}`);
		return;
	});
}

/* istanbul ignore next: Difficult to unit test */
export function activate(context: vscode.ExtensionContext) {

	const completion = vscode.languages.registerCompletionItemProvider({ pattern: '**/userChrome.css' }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			let completions: vscode.CompletionItem[] = [];

			for (const [platform, values] of Object.entries(json.completions)) {

				if (!isPlatformAllowedByConfiguration(platform)) {
					continue;
				}

				// @ts-ignore: TS2488
				for (const element of values) {
					const completion = new vscode.CompletionItem({ label: element.label!, description: `Firefox CSS` }, vscode.CompletionItemKind.Snippet);
					completion.documentation = new vscode.MarkdownString(`${getDesriptionPrefix(platform)}\`\`\`css\n${element.snippet!}`);
					completion.insertText = new vscode.SnippetString(element.snippet!);
					completions.push(completion);
				};
			};

			return completions;
		}
	});

	const launch = vscode.commands.registerCommand('firefox-css.launch', () => {
		const closeExisting = vscode.workspace.getConfiguration('firefoxCSS').get<boolean>('launch.closeExisting');
		if (closeExisting) {
			spawn_("taskkill", ["/IM", "firefox.exe"]);
		}

		const firefoxExecutableLocation = getFirefoxExectuableLocation();
		if (firefoxExecutableLocation) {
			spawn_(`${firefoxExecutableLocation}`);
		} else {
			vscode.window.showWarningMessage("Could not find Firefox executable location.")
		}
	});

	context.subscriptions.push(completion, launch);
}

/* istanbul ignore next: Empty function */
export function deactivate() { }
