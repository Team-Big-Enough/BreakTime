// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { countReset } from 'console';
import * as vscode from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	let min: number;
	let sec: number;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-breaktime" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-breaktime.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('休憩してください！', {
			modal: true,
		});


		timer(5, 0);

	});


	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function timer(min: number, sec: number){
	// vscode.window.showInformationMessage('3秒経過しました。');

	// var id = setTimeout(timer, 1000, min, sec);

	if(sec - 1 === -1){
		min --;
		sec = 59;
	}
	else{
		sec --;
	}
	console.log(min, sec);
	// vscode.window.showInformationMessage("残り"+min+ "分"+sec+"秒です!");
	vscode.window.setStatusBarMessage("残り"+min+ "分"+sec+"秒です!", min*60000+sec*1000);
	var id = setTimeout(timer, 1000, min, sec);
	// var id = setInterval(timer, 2000, min, sec);

	if(min < 0 ){
		// clearTimeout(id);
		clearTimeout(id);
		vscode.window.showInformationMessage('休憩終了です！', {
			modal: true,
		});
	}

}
