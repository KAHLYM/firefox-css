import * as vscode from 'vscode';
import fs from "fs";
import { spawn_, spawnSync_ } from './child_process';
import { completions, downloadCompletions } from './completions';
var constants = require('./constants');
import configuration = require('./configuration');

export const output = vscode.window.createOutputChannel(constants.extension.NAME);

const geckoDevPlatforms = Object.freeze({
	LINUX: "linux",
	OSX: "osx",
	WINDOWS: "windows"
});

export function isPlatformAllowedByConfiguration(platform: string, targetPlatform_: string = ""): boolean {
	const targetPlatform = targetPlatform_ ? targetPlatform_ : configuration.get<string>(constants.configuration.targetPlatform.KEY);
	const targetPlatforms = constants.configuration.targetPlatform;
	switch (platform) {
		case geckoDevPlatforms.LINUX:
			return [targetPlatforms.ALL, targetPlatforms.LINUX].includes(targetPlatform!);
		case geckoDevPlatforms.OSX:
			return [targetPlatforms.ALL, targetPlatforms.MACOS].includes(targetPlatform!);
		case geckoDevPlatforms.WINDOWS:
			return [targetPlatforms.ALL, targetPlatforms.WINDOWS].includes(targetPlatform!);
		default:
			return true;
	}
}

/* istanbul ignore next: Platform dependant */
export function getFirefoxExectuableLocation(): string | null {
	// Return user configuration if provided
	const path = configuration.get<string>(constants.configuration.launchPath.KEY);
	if (path && fs.existsSync(path)) {
		return path;
	}

	// Otherwise, attempt to find Firefox exectuable 
	switch (process.platform) {
		case constants.platform.DARWIN:
		case constants.platform.FREEBSD:
		case constants.platform.LINUX:
		case constants.platform.SUNOS:
			return null;
		case constants.platform.WIN32:
			return `${process.env.PROGRAMFILES}\\Mozilla Firefox\\${constants.firefox.file.USERCHROME_CSS}`;
		default:
			return null;
	}
}

/* istanbul ignore next: Platform dependant */
export function closeExistingFirefoxExecutables(): void {
	switch (process.platform) {
		case constants.platform.DARWIN:
		case constants.platform.FREEBSD:
		case constants.platform.LINUX:
		case constants.platform.SUNOS:
			return;
		case constants.platform.WIN32:
			spawnSync_("taskkill", ["/F", "/IM", constants.firefox.file.EXECUTABLE]);
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

	await downloadCompletions(configuration.get<string>(constants.configuration.source.KEY)!);

	const configurationChangedSource = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration(`${constants.configuration.SECTION}.${constants.configuration.source.KEY}`)) {
			downloadCompletions(configuration.get<string>(constants.configuration.source.KEY)!);
		}
	});

	const completion = vscode.languages.registerCompletionItemProvider({ pattern: `**/${constants.firefox.file.USERCHROME_CSS}` }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			let completionItems: vscode.CompletionItem[] = [];

			for (const [platform, values] of Object.entries(completions.completions)) {

				if (!isPlatformAllowedByConfiguration(platform)) {
					continue;
				}

				// @ts-ignore: TS2488
				for (const element of values) {
					const completion = new vscode.CompletionItem({ label: element.label!, description: constants.extension.NAME }, vscode.CompletionItemKind.Snippet);
					completion.documentation = new vscode.MarkdownString(`\`\`\`css\n${element.snippet!}\n\`\`\`\n\nSource: ${element.source}`);
					completion.insertText = new vscode.SnippetString(element.snippet!);
					completionItems.push(completion);
				};
			};

			return completionItems;
		}
	});

	const launch = vscode.commands.registerCommand(constants.command.LAUNCH, () => {
		if (configuration.get<boolean>(constants.configuration.launchCloseExisting.KEY)) {
			closeExistingFirefoxExecutables();
		}

		openFirefoxExecutable();
	});

	context.subscriptions.push(configurationChangedSource, completion, launch);

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (configuration.get<boolean>(constants.configuration.launchOnSave.KEY)) {
			if (document.fileName.endsWith(constants.firefox.file.USERCHROME_CSS)) {
				vscode.commands.executeCommand(constants.command.LAUNCH);
			}
		}
	});
}

/* istanbul ignore next: Empty function */
export function deactivate() { }
