// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('休憩しましょう');
		// function getWebviewContent(breaktime){
		// }
		// context.subscriptions.push(disposable);//この拡張機能の登録解除時にVS Codeから取得したリソースを解放するための処理
	});

	//const kyuukeiFigures = {'休憩': 'homelu.jpeg'};
	const kyuukeiFigures = {'休憩': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixzkaQI4759eBna_CffZH0DkXV7w1cJV_QPcYJMRO8X5ZsLnXrqHJi3QxQFsrYY85aPCnunvHebaBS2hUayLfcSLPiz0GJBjcO7nwWq019lDW4qCDg6d3fCy7k4dHghyM3mTBO_XXn0ExyduUJu537k187TDICM1a-e1RckDLmv6BEjab9g_3SbaLQ/s640/1204639_s%20(1).jpg'};
	function getWebviewContent(kyuukeiResult: keyof typeof kyuukeiFigures) {
		return `<!DOCTYPE html>
		<html lang="ja">
		<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body>
		<img src="${kyuukeiFigures[kyuukeiResult]}" />
		</body>
		</html>`;
	}
	const kyuukeiCandidates = ['休憩'] as const;
	const kyuukeiResult = kyuukeiCandidates[Math.floor(Math.random() * kyuukeiCandidates.length)];
	const panel = vscode.window.createWebviewPanel('breaktime',`お疲れ様です。${kyuukeiResult}のお時間です！`,vscode.ViewColumn.One,{});
	panel.webview.html = getWebviewContent(kyuukeiResult);

	// const message = vscode.window.showInformationMessage("Information Message!", {
	// 	modal: true,
	//   });
}

// this method is called when your extension is deactivated
export function deactivate() {}
