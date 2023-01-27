'use strict';
import * as vscode from "vscode";
import Asset from "./asset";
import { ReminderView } from './reminderView';
import { Utility } from './utility';

export class Scheduler {
    private timer : NodeJS.Timeout | null = null


    public constructor(private context: vscode.ExtensionContext) {
    }

    public start() {
        if (this.timer != null) return;
        this.timer = setInterval(() => {
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
        }, 1000 * 60 * Math.max(Utility.getConfiguration().get<number>('reminderViewIntervalInMinutes', 60), 1));
    }

    public stop() {
        if (this.timer == null) return;
        clearInterval(this.timer);
        this.timer = null;
    }
}