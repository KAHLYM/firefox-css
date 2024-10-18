// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import json from '../completions.json';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "firefox-css" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('firefox-css.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from firefox-css!');
	});

	const completion = vscode.languages.registerCompletionItemProvider({ pattern: '**/userChrome.css' }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			let completions: vscode.CompletionItem[] = [];

			for (let element of json.completions) {
				const completion = new vscode.CompletionItem({ label: element.label!, description: "Firefox CSS" }, vscode.CompletionItemKind.Snippet);
				completion.documentation = new vscode.MarkdownString(`\`\`\`css\n${element.snippet!}`);
				completion.insertText = new vscode.SnippetString(element.snippet!);
				completions.push(completion);
			};

			return completions;
		}
	});

	context.subscriptions.push(disposable, completion);
}

// This method is called when your extension is deactivated
export function deactivate() { }
