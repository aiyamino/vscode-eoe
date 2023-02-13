'use strict';
import axios from 'axios';
import * as vscode from 'vscode';
import Asset, {EOEGetRandomPicResult, isEOEDefaultPicResult, isEOEGetRandomPicResult} from './asset';

interface ButtonMessage {
    command: string;
    args: string;
}

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    public static async show(context: vscode.ExtensionContext) {
        let asset: Asset = new Asset();

        let panel_initialized = false;
        if (!this.panel){
            this.panel = vscode.window.createWebviewPanel("eoe", "EOE", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
            panel_initialized = true;
        }

        const imagePath = await asset.getImageUri();
        if (isEOEGetRandomPicResult(imagePath)) {
            const name = asset.getName(imagePath.tags);
            let title = asset.getNamedTitle(name);
            if (Asset.isWebContext()) {
                imagePath.img = 'https://images.weserv.nl/?url=' + imagePath.img;
            }
            this.panel.webview.html = this.generateOnlineHtml(imagePath, title);
        } else if (isEOEDefaultPicResult(imagePath)){
            let title = "";
            if (imagePath.tag === 'kuoyu') {
                title = asset.getKuoYuTitle();
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
                async (message: ButtonMessage) =>{
                    switch(message.command) {
                        case "refresh":
                            ReminderView.show(context);
                            break;
                        case "open":
                            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(message.args));
                            break;
                        case "report":
                            await axios.post(
                                "https://api.eoe.best/eoefans-api/v1/pic/feedback?subscription-key=3cc4284fbb864965a7a9ad0f28af8496", message.args, { headers: {
                                    "Content-Type": "application/json"
                                }});
                            break;
                    }
                }
            );
        }
    }

    protected static generateOnlineHtml(imagePath: EOEGetRandomPicResult, title: string) {
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="module" src="https://cdn.jsdelivr.net/npm/@vscode/webview-ui-toolkit/dist/toolkit.min.js"></script>
            <script>
                const vscode = acquireVsCodeApi();

                window.addEventListener("load", main);

                function main() {
                    const refreshButton = document.getElementById("refresh");
                    refreshButton.addEventListener("click", () => vscode.postMessage({command: "refresh", args: ""}));

                    const sourceButton = document.getElementById("source");
                    sourceButton.addEventListener("click", () => vscode.postMessage({command: "open", args: "${imagePath.dy_url}"}));

                    const dropdownBox = document.getElementById("dropdown");
                    const successLabel = document.getElementById("success");
                    dropdownBox.onchange = () => {
                        let index = dropdownBox.selectedIndex;
                        if (index != 0) {
                            vscode.postMessage({command: "report", args: {
                                "dynamic_id_str": "${imagePath.dy_id}",
                                "feedback": index,
                                "img_id": ${imagePath.img_id}}});
                            dropdownBox.remove();
                            successLabel.style.visibility = "visible";
                        }
                    };
                }
            </script>
            <title>EOE</title>
        </head>
        <body>
        <div><h1>${title}</h1></div>
        <div style="margin-bottom: 8px;">
            <vscode-button id="refresh" style="display: inline-block; vertical-align: middle; height: 28px;">再来一张!</vscode-button>&nbsp;
            <vscode-button id="source" style="display: inline-block; vertical-align: middle; height: 28px;">来源…</vscode-button>&nbsp;
            <vscode-dropdown id="dropdown" style="display: inline-block; vertical-align: middle; width: 200px; height: 28px;">
                <vscode-option>反馈…</vscode-option>
                <vscode-option>这张图不能算做EOE的二创…</vscode-option>
                <vscode-option>这张图的标签不正确…</vscode-option>
                <vscode-option>这张图不宜在工作期间观看…</vscode-option>
                <vscode-option>这张图包含令人不适的内容…</vscode-option>
            </vscode-dropdown>
            <label id="success" style="display: inline-block; vertical-align: middle;visibility:collapse; line-height: 28px;">感谢您做出的反馈！</label>
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
            <title>EOE</title>
        </head>
        <script type="module" src="https://cdn.jsdelivr.net/npm/@vscode/webview-ui-toolkit/dist/toolkit.min.js"></script>
        <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener("load", main);

            function main() {
                const refreshButton = document.getElementById("refresh");
                refreshButton.addEventListener("click", () => vscode.postMessage({command: "refresh", args: ""}));
            }
        </script>
        <body>
            <div><h1>${title}</h1></div>
            <div style="margin-bottom: 8px;">
                <vscode-button id="refresh" style="display: inline-block; vertical-align: middle; height: 28px;">再来一张!</vscode-button>
            </div>
            <div/>
            <div><img src="${imagePath}"></div>
        </body>
        </html>`;
        return html;
    }
}
