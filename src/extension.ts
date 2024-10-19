import * as vscode from 'vscode';
import json from '../completions.json';

export function isPlatformAllowedByConfiguration(platform: string, targetPlatform_: string = ""): boolean {
	const targetPlatform = targetPlatform_ ? targetPlatform_ : vscode.workspace.getConfiguration('firefoxCSS').get<string>('targetPlatform');
	switch (platform) {
		case "linux":
			if (!["All", "Linux"].includes(targetPlatform!)) {
				return false;
			}
		case "osx":
			if (!["All", "macOS"].includes(targetPlatform!)) {
				return false;
			}
		case "windows":
			if (!["All", "Windows"].includes(targetPlatform!)) {
				return false;
			}
		default:
			return true;
	}
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

	context.subscriptions.push(completion);
}

export function deactivate() { }
