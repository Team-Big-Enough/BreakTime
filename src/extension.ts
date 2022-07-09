// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-breaktime" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-breaktime.helloWorld', () => {

		// webviewはローカルリソースに直接アクセスできないらしい
		// 読み込みたいときはWebview.asWebviewUri関数を使って、読み込める形に変換しないといけない
		// https://code.visualstudio.com/api/extension-guides/webview#loading-local-content
		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'Graph', // Identifies the type of the webview. Used internally
			'test area', // Title of the panel displayed to the user
			vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
			{enableScripts: true} // Webview options. More on these later.
		);

		const graphPath = vscode.Uri.file(
			path.join(context.extensionPath, 'src', 'graph.js')
		);
		const graphSrc = panel.webview.asWebviewUri(graphPath);

		panel.webview.html = getWebviewContent(graphSrc);
	});

	context.subscriptions.push(disposable);	
}

function getWebviewContent(graphSrc: vscode.Uri){
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>title</title>
	</head>
	<body>
		<h1>title</h1>

		<div class=""><input type="radio" name="analysis" value="bar" checked>縦棒グラフ</div>
		<div class=""><input type="radio" name="analysis" value="Line">折れ線グラフ</div>
		<div class=""><input type="radio" name="analysis" value="3">散布図</div>

		<div>
			<canvas id="graph" width="100%"></canvas>
		</div>

		<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.js"></script>
		<script src=` + graphSrc + `></script>
	</body>
	</html>
	`;
}

function showModalMessage(msg: string){
		vscode.window.showInformationMessage(msg, {modal: true});
}

// this method is called when your extension is deactivated
export function deactivate() {}
