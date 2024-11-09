import { output } from './extension';

export let completions: any;
export async function downloadCompletions(source: string): Promise<void> {
    const url = `https://raw.githubusercontent.com/KAHLYM/firefox-css/refs/heads/completions/completions/${source}.json`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text);

        output.appendLine(`Fetched completions (${text.length} bytes) from: ${url}`);
        completions = json;
        return;

    } catch (error) {
        /* istanbul ignore next: difficult to force fetch to throw */
        console.error("Failed to fetch completions:", error);
    }
}
