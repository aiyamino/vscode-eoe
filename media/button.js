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
