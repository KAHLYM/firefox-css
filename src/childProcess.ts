import { spawn, spawnSync } from 'node:child_process';
import { output } from './extension';

export function spawn_(command: string, args?: readonly string[],): void {
    const process = spawn(command, args);

    /* istanbul ignore next: difficult to force process to pipe to stderr */
    process.stderr.on("data", (data) => {
        output.appendLine(`Launching ${command} failed with stderr: ${data}`);
    });
}

export function spawnSync_(command: string, args?: readonly string[],): void {
    const process = spawnSync(command, args);

    /* istanbul ignore next: difficult to force process to pipe to stderr */
    if (process.stderr) {
        output.appendLine(`Launching ${command} failed with stderr: ${process.stderr}`);
    }
}
