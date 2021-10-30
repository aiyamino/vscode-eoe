'use strict';
import * as vscode from 'vscode';
import Asset, { ASoulGetRandomPicResult } from './asset';
import {ImageSource, isASoulGetRandomPicResult, isUri} from './asset'

interface ButtonMessage {
    command: string,
    args: string
}

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    public static async show(context: vscode.ExtensionContext) {
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

        if (!this.panel){
            this.panel = vscode.window.createWebviewPanel("asoul", "A-SOUL", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }


        if (isASoulGetRandomPicResult(imagePath)) {
            let toolkitUri = this.panel.webview.asWebviewUri(asset.getWebviewToolkitURI());
            let buttonJsUri = this.panel.webview.asWebviewUri(asset.getButtonJsURI());
            this.panel.webview.html = this.generateOnlineHtml(imagePath, title, toolkitUri, buttonJsUri);
        } else {
            this.panel.webview.html = this.generateHtml(imagePath, title);
        }

        this.panel.reveal();
        this.panel.webview.onDidReceiveMessage(
            (message: ButtonMessage) =>{
                switch(message.command) {
                    case "refresh":
                        vscode.commands.executeCommand('asoul.showReminderView')
                        this.panel?.dispose()
                        break
                    case "open":
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(message.args));
                        break
                }
            }
        )
    }

    protected static generateOnlineHtml(imagePath: ASoulGetRandomPicResult, title: string, toolkitUri: vscode.Uri, buttonJsUri: vscode.Uri) {
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="image-source" content="${imagePath.dy_url}">
            <script type="module" src="${toolkitUri}"></script>
            <script type="module" src="${buttonJsUri}"></script>
            <title>A-SOUL</title>
        </head>
        <body>
        <div><h1>${title}</h1></div>
        <div style="margin-bottom: 8px;">
            <vscode-button id="refresh">再来一张!</vscode-button>&nbsp;
            <vscode-button id="source">来源…</vscode-button>&nbsp;
            <vscode-button id="more">更多…</vscode-button>
        </div>
        <div/>
        <div><img src="${imagePath.img}"></div>
        </body>
        </html>`;
        return html;
    }

    protected static generateHtml(imagePath: ImageSource, title: string): string {
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>A-SOUL</title>
        </head>
        <body>
            <div><h1>${title}</h1></div>
            <div><img src="${imagePath}"></div>
        </body>
        </html>`;
        return html;
    }
}

// <div><h2><a href="${imagePath.dy_url}">来源…</a>  <a href="https://asoul.cloud/pic">更多…</a></h2></div>