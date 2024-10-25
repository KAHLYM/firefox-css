import * as vscode from 'vscode';
var constants = require('./constants');

export function get<T>(section: string): T | undefined {
    return vscode.workspace.getConfiguration(constants.configuration.SECTION).get<T>(section);
};
