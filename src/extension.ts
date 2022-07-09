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
		createWebView();
		showModalMessage("aa");
		// showModalMessage('Hello World from vscode-breaktime!');
	});
	

	context.subscriptions.push(disposable);
}

function createWebView(){
	// Create and show a new webview
	const panel = vscode.window.createWebviewPanel(
		'Graph', // Identifies the type of the webview. Used internally
		'test area', // Title of the panel displayed to the user
		vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
		{} // Webview options. More on these later.
		);
}

function showModalMessage(msg: string){
		vscode.window.showInformationMessage(msg, {modal: true});
}

// this method is called when your extension is deactivated
export function deactivate() {}
