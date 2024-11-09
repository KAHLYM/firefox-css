import * as vscode from 'vscode';
import { output } from './extension';
const constants = require('./constants');
const path = require('path');

/* istanbul ignore next: laziness */
export async function getCompletions(source: string): Promise<any> {
    // This should be a JSON object
    let completions: any = await download(source);

    if (!completions) { // then attempt to get completions from cache
        await vscode.window.showWarningMessage("Failed to download completions.",
            constants.strings.message.getCompletions.TRY_AGAIN, constants.strings.message.getCompletions.USE_CACHE)
            .then(async value => {
                if (value == constants.strings.message.getCompletions.TRY_AGAIN) {
                    completions = await getCompletions(source);
                } else if (value == constants.strings.message.getCompletions.USE_CACHE) {
                    completions = await getCache(source);
                }
            });
    }

    return completions;
}

/* istanbul ignore next: laziness */
async function download(source: string): Promise<any> {
    const url = `https://raw.githubusercontent.com/KAHLYM/firefox-css/refs/heads/completions/completions/${source}.json`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text);

        output.appendLine(`Downloaded completions (${text.length} bytes) from: ${url}`);

        setCache(source, text);

        return json;

    } catch (error) {
        /* istanbul ignore next: difficult to force fetch to throw */
        console.error("Failed to download completions: ", error);
    }
}

/* istanbul ignore next: platform dependant */
function getCacheUri(source: string): vscode.Uri {
    return vscode.Uri.file(`${process.env.LOCALAPPDATA!}${path.sep}${constants.extension.NAME}${path.sep}${source}.json`);
}

/* istanbul ignore next: laziness */
async function getCache(source: string): Promise<any> {
    try {
        const uri: vscode.Uri = getCacheUri(source);
        return await vscode.workspace.fs.readFile(uri).then(async content => {
            const decoder = new TextDecoder("utf-8");
            const decoded = decoder.decode(content);
            const json = JSON.parse(decoded);

            output.appendLine(`Fetched completions (${content.length} bytes) from: ${uri.toString()}`);

            return json;
        });
    } catch (error) {
        /* istanbul ignore next: difficult to force readFile to throw */
        console.error("Failed to read completions from cache: ", error);
    }
}

/* istanbul ignore next: laziness */
function setCache(source: string, content: string): void {
    try {
        const encoder = new TextEncoder();
        vscode.workspace.fs.writeFile(getCacheUri(source), encoder.encode(content));
    } catch (error) {
        /* istanbul ignore next: difficult to force writeFile to throw */
        console.error("Failed to write completions to cache: ", error);
    }
}
