import * as vscode from 'vscode';
import { output } from './extension';
var constants = require('./constants');

export async function getCompletions(source: string): Promise<any> {
    let completions = await download(source);

    if (!completions) { // then attempt to get completions from cache
        vscode.window.showWarningMessage("Failed to download completions.",
            constants.strings.message.getCompletions.TRY_AGAIN, constants.strings.message.getCompletions.USE_CACHE)
            .then(async value => {
                if (value == constants.strings.message.getCompletions.TRY_AGAIN) {
                    completions = await getCompletions(source);
                } else if (value == constants.strings.message.getCompletions.USE_CACHE) {
                    completions = getFromCache();
                }
            });
    }

    return completions;
}

async function download(source: string): Promise<any> {
    const url = `https://raw.githubusercontent.com/KAHLYM/firefox-css/refs/heads/completions/completions/${source}.json`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(JSON.stringify(text));

        output.appendLine(`Downloaded completions (${text.length} bytes) from: ${url}`);
        return json;

    } catch (error) {
        /* istanbul ignore next: difficult to force fetch to throw */
        console.error("Failed to download completions: ", error);
    }
}

function getFromCache(): void {

}
