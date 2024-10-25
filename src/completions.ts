export let completions: any;
export async function downloadCompletions(source: string): Promise<string | void> {
    fetch(`https://raw.githubusercontent.com/KAHLYM/firefox-css/refs/heads/completions/completions/${source}.json`)
        .then(res => res.text())
        .then(text => JSON.parse(text))
        .then(json => {
            completions = json;
        });
}
