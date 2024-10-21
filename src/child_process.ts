import * as vscode from 'vscode';
import { spawn, spawnSync } from 'node:child_process';

let output = vscode.window.createOutputChannel("Firefox CSS");

/* istanbul ignore next: Wrapper functions */
export function spawn_(command: string, args?: readonly string[],): void {
    const process = spawn(command, args);

    process.stderr.on("data", (data) => {
        output.appendLine(`Launching ${command} failed with stderr: ${data}`);
    });
}

/* istanbul ignore next: Wrapper functions */
export function spawnSync_(command: string, args?: readonly string[],): void {
    const process = spawnSync(command, args);

    if (process.stderr) {
        output.appendLine(`Launching ${command} failed with stderr: ${process.stderr}`);
    }
}
