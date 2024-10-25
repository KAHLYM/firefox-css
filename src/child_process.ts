import { spawn, spawnSync } from 'node:child_process';
import { output } from './extension';

export function spawn_(command: string, args?: readonly string[],): void {
    const process = spawn(command, args);

    process.stderr.on("data", (data) => {
        output.appendLine(`Launching ${command} failed with stderr: ${data}`);
    });
}

export function spawnSync_(command: string, args?: readonly string[],): void {
    const process = spawnSync(command, args);

    if (process.stderr) {
        output.appendLine(`Launching ${command} failed with stderr: ${process.stderr}`);
    }
}
