import * as vscode from 'vscode';
import json from '../completions.json';

export function activate(context: vscode.ExtensionContext) {

	const completion = vscode.languages.registerCompletionItemProvider({ pattern: '**/userChrome.css' }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			let completions: vscode.CompletionItem[] = [];

			const targetPlatform = vscode.workspace.getConfiguration('firefoxCSS').get<string>('targetPlatform');

			for (const [platform, values] of Object.entries(json.completions)) {

				// Skip appropraiate platform-specific completions
				switch (platform) {
					case "linux":
						if (!["All", "Linux"].includes(targetPlatform!)) {
							continue;
						}
						break;
					case "osx":
						if (!["All", "macOS"].includes(targetPlatform!)) {
							continue;
						}
						break;
					case "windows":
						if (!["All", "Windows"].includes(targetPlatform!)) {
							continue;
						}
						break;
				}

				for (let element of values) {
					const completion = new vscode.CompletionItem({ label: element.label!, description: "Firefox CSS" }, vscode.CompletionItemKind.Snippet);
					completion.documentation = new vscode.MarkdownString(`\`\`\`css\n${element.snippet!}`);
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
