'use strict';
import * as vscode from 'vscode';
import Asset from './asset';
import {ImageSource, isASoulGetRandomPicResult, isUri} from './asset'

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    public static async show(context: vscode.ExtensionContext, ) {
        let asset: Asset = new Asset(context);

        const imagePath = await asset.getImageUri();
        let title = "";
        if (isASoulGetRandomPicResult(imagePath)) {
            const name = asset.getName(imagePath.tags);
            title = asset.getNamedTitle(name);
        } else if (isUri(imagePath)) {
            if (imagePath.path.includes('niuniu')) {
                title = asset.getTitle();
                title += " 勇敢牛牛，不怕困难！"
            } else {
                const name = asset.getNameFromUri(imagePath);
                title = asset.getNamedTitle(name);
            }
        } else {
            title = asset.getTitle();
        }

        if (this.panel) {
            this.panel.webview.html = this.generateHtml(imagePath, title);
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel("asoul", "A-SOUL", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.webview.html = this.generateHtml(imagePath, title);
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
    }

    protected static generateHtml(imagePath: ImageSource, title: string): string {
        let html1 = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>A-SOUL</title>
        </head>
        <body>`;

        let html2: string;
        if (isASoulGetRandomPicResult(imagePath)) {
            html2 = `
            <div><h1>${title} (<a href="${imagePath.dy_url}">来源</a>)</h1></div>
            <div><img src="${imagePath.img}"></div>`;
        } else {
            html2 = `
            <div><h1>${title}</h1></div>
            <div><img src="${imagePath}"></div>`;
        }

        let html3=`
        </body>
        </html>`;

        return html1 + html2 + html3;
    }
}