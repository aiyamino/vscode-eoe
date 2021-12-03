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
        let asset: Asset = new Asset();

        let panel_initialized = false;
        if (!this.panel){
            this.panel = vscode.window.createWebviewPanel("asoul", "A-SOUL", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
            panel_initialized = true;
        }

        const imagePath = await asset.getImageUri();
        if (isASoulGetRandomPicResult(imagePath)) {
            const name = asset.getName(imagePath.tags);
            let title = asset.getNamedTitle(name);
            if (Asset.isWebContext()) {
                imagePath.img = 'https://images.weserv.nl/?url=' + imagePath.img;
            }
            this.panel.webview.html = this.generateOnlineHtml(imagePath, title);
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
            if (Asset.isWebContext()) {
                imagePath.img = 'https://images.weserv.nl/?url=' + imagePath.img;
            }
            this.panel.webview.html = this.generateHtml(imagePath.img, title);
        } else {
            let title = asset.getTitle();
            if (Asset.isWebContext()) {
                this.panel.webview.html = this.generateHtml('https://images.weserv.nl/?url=' + imagePath, title);
            } else {
                this.panel.webview.html = this.generateHtml(imagePath, title);
            }
        }

        this.panel.reveal();
        if (panel_initialized) {
            this.panel.webview.onDidReceiveMessage(
                (message: ButtonMessage) =>{
                    switch(message.command) {
                        case "refresh":
                            ReminderView.show(context);
                            break
                        case "open":
                            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(message.args));
                            break
                    }
                }
            )
        }
    }

    protected static generateOnlineHtml(imagePath: ASoulGetRandomPicResult, title: string) {
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="image-source" content="${imagePath.dy_url}">
            <meta name="author-homepage" content="https://asoul.cloud/space/${imagePath.owner.uid}">
            <script type="module" src="https://cdn.jsdelivr.net/npm/@vscode/webview-ui-toolkit/dist/toolkit.min.js"></script>
            <script>
                const vscode = acquireVsCodeApi();

                window.addEventListener("load", main);

                function main() {
                    const imageSource = document.getElementsByTagName('meta')['image-source'].content;
                    const authorHomepage = document.getElementsByTagName('meta')['author-homepage'].content;

                    const refreshButton = document.getElementById("refresh");
                    refreshButton.addEventListener("click", () => vscode.postMessage({command: "refresh", args: ""}));

                    const sourceButton = document.getElementById("source");
                    sourceButton.addEventListener("click", () => vscode.postMessage({command: "open", args: imageSource}));

                    const moreButton = document.getElementById("more");
                    moreButton.addEventListener("click", () => vscode.postMessage({command: "open", args: authorHomepage}))
                }
            </script>
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
