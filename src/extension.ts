'use strict';
import * as vscode from 'vscode';
import { ReminderView } from './reminderView';
import { Scheduler } from './scheduler';

export function activate(context: vscode.ExtensionContext) {
    const scheduler = new Scheduler(context);
    scheduler.start();

    context.subscriptions.push(vscode.commands.registerCommand('asoul.showReminderView', () => {
        ReminderView.show(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('asoul.openGallery', () => {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://asoul.cloud/pic'));
    }));
}

export function deactivate() {
}