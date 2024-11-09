import * as vscode from 'vscode';
import fs from "fs";
import { spawn_, spawnSync_ } from './childProcess';
import { getCompletions } from './completions';
var constants = require('./constants');
import configuration = require('./configuration');

export const output = vscode.window.createOutputChannel(constants.extension.NAME);

/* istanbul ignore next: Appease coverage */
export function isPlatformAllowedByConfiguration(platform: string, targetPlatform_: string = ""): boolean {
	const targetPlatform = targetPlatform_ ? targetPlatform_ : configuration.get<string>(constants.configuration.targetPlatform.KEY);
	const targetPlatforms = constants.configuration.targetPlatform.enum;
	switch (platform) {
		case "linux":
			return [targetPlatforms.ALL, targetPlatforms.LINUX].includes(targetPlatform!);
		case "osx":
			return [targetPlatforms.ALL, targetPlatforms.MACOS].includes(targetPlatform!);
		case "windows":
			return [targetPlatforms.ALL, targetPlatforms.WINDOWS].includes(targetPlatform!);
		default:
			return true;
	}
}

/* istanbul ignore next: platform-dependant */
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

/* istanbul ignore next: platform-dependant */
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

/* istanbul ignore next: platform-dependant */
export function openFirefoxExecutable(): void {
	const firefoxExecutableLocation = getFirefoxExectuableLocation();
	if (firefoxExecutableLocation) {
		spawn_(`${firefoxExecutableLocation}`);
	} else {
		vscode.window.showWarningMessage("Could not find Firefox executable location.");
	}
}

/* istanbul ignore next: should be refactored */
let completions: any;
export async function activate(context: vscode.ExtensionContext) {

	/* istanbul ignore next: laziness */
	completions = await getCompletions(configuration.get<string>(constants.configuration.source.KEY)!);

	/* istanbul ignore next: laziness */
	const onChangeConfigurationSource = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration(`${constants.configuration.SECTION}.${constants.configuration.source.KEY}`)) {
			completions = getCompletions(configuration.get<string>(constants.configuration.source.KEY)!);
		}
	});

	/* istanbul ignore next: laziness */
	const completionItemProviderUserChrome = vscode.languages.registerCompletionItemProvider({ pattern: `**/${constants.firefox.file.USERCHROME}` }, {
		provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext) {

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

	/* istanbul ignore next: laziness */
	const commandLaunch = vscode.commands.registerCommand(constants.command.LAUNCH, () => {
		if (configuration.get<boolean>(constants.configuration.launchCloseExisting.KEY)) {
			closeExistingFirefoxExecutables();
		}

		openFirefoxExecutable();
	});

	/* istanbul ignore next: laziness */
	context.subscriptions.push(commandLaunch, completionItemProviderUserChrome, onChangeConfigurationSource);

	/* istanbul ignore next: laziness */
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (configuration.get<boolean>(constants.configuration.launchOnSave.KEY)) {
			if (document.fileName.endsWith(constants.firefox.file.USERCHROME_CSS)) {
				vscode.commands.executeCommand(constants.command.LAUNCH);
			}
		}
	});
}

export function deactivate() { }
