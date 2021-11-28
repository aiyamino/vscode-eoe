'use strict';
import * as vscode from 'vscode';
import Asset, {ASoulGetRandomPicResult, isASoulDefaultPicResult, isASoulGetRandomPicResult} from './asset';

interface ButtonMessage {
    command: string,
    args: string
}

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    public static async show(context: vscode.ExtensionContext) {
        let asset: Asset = new Asset(context);

        if (!this.panel){
            this.panel = vscode.window.createWebviewPanel("asoul", "A-SOUL", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        const imagePath = await asset.getImageUri();
        if (isASoulGetRandomPicResult(imagePath)) {
            const name = asset.getName(imagePath.tags);
            let title = asset.getNamedTitle(name);
            let toolkitUri = this.panel.webview.asWebviewUri(asset.getWebviewToolkitURI());
            let buttonJsUri = this.panel.webview.asWebviewUri(asset.getButtonJsURI());
            this.panel.webview.html = this.generateOnlineHtml(imagePath, title, toolkitUri, buttonJsUri);
        } else if (isASoulDefaultPicResult(imagePath)){
            let title = "";
            if (imagePath.tag === 'niuniu') {
                title = asset.getTitle();
                title += " 勇敢牛牛，不怕困难！"
            } else if (imagePath.tag === 'cao') {
                title = asset.getCaoTitle();
            } else {
                title = asset.getNamedTitle(imagePath.tag);
            }
            this.panel.webview.html = this.generateHtml(imagePath.img, title);
        } else {
            let title = asset.getTitle();
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
            <meta name="author-homepage" content="https://asoul.cloud/space/${imagePath.owner.uid}">
            <script type="module" src="${toolkitUri}"></script>
            <script type="module" src="${buttonJsUri}"></script>
            <title>A-SOUL</title>
        </head>
        <body>
        <div><h1>${title}</h1></div>
        <div style="margin-bottom: 8px;">
            <vscode-button id="refresh">再来一张!</vscode-button>&nbsp;
            <vscode-button id="source">来源…</vscode-button>&nbsp;
            <vscode-button id="more">更多 @${imagePath.owner.name} 的作品…</vscode-button>
        </div>
        <div/>
        <div><img src="${imagePath.img}"></div>
        </body>
        </html>`;
        return html;
    }

    protected static generateHtml(imagePath: string | vscode.Uri, title: string): string {
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