'use strict';
import * as vscode from "vscode";
import { ReminderView } from './reminderView';
import { Utility } from './utility';

export class Scheduler {
    public constructor(private context: vscode.ExtensionContext) {
    }

    public start() {
        setInterval(() => {
            const notification = Utility.getConfiguration().get<boolean>('notification', false);

            if (notification) {
                const title = Utility.getConfiguration().get<string>('title', '');
                vscode.window.showInformationMessage(title, "放松一下!").then((val) => {
                    if (val) {
                        ReminderView.show(this.context);
                    }
                })
            } else {
                ReminderView.show(this.context);
            }
        }, 1000 * 60 * Utility.getConfiguration().get<number>('reminderViewIntervalInMinutes', 60));
    }
}