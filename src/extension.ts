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
	});

	const kyuukeiFigures = {'休憩': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEibNNjxJIu-0NU_bkVjslf6-CN7u6VGUUQsst4_-_PhGbaASpwuoDsF6fvtliWir7rfrB45XGZHdEbVCAp1utUWG7dhfWDp2-DG_r3-s0agCs5srD2qqRjaQdYXYE-iBd2BGloB_J62bjZYJ0pGdIAQsyMMNTCbJtaqVeUYtwfxB1SmxoNB-qQMQSGp/s1000/11792.gif'};
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

	// (".confirm").modaal({
	// 	type:'confirm',
	// 	confirm_title: 'ログイン画面',//確認画面タイトル
	// 	confirm_button_text: 'ログイン', //確認画面ボタンのテキスト
	// 	confirm_cancel_button_text: 'キャンセル',//確認画面キャンセルボタンのテキスト
	// 	confirm_content: 'ログインが必要です。<br>この画面はボタンを押さなければ閉じません。',//確認画面の内容
	//   });
}

// this method is called when your extension is deactivated
export function deactivate() {}
