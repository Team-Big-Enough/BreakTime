// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { EndOfLineState } from 'typescript';
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
		vscode.window.showInformationMessage('Hello World from vscode-breaktime!',{
			modal: true
		});
	});

	/*
	let editor = vscode.window.activeTextEditor; // 現在開いているエディタ
	let document = editor?.document; // ドキュメント

	let linePrev = 0; // ドキュメントの変更前の行数
	let lineNow = document?.lineCount;
	let line = 0; // 行数を格納する変数

	line = lineNow - linePrev;
	*/




	context.subscriptions.push(disposable);
}

// 文字をカウントするクラス
export class CharCount{
	private _stringNum: number = 0; // 現在の文字数
	private _lineNum: number = 0; // 現在の行数
	private _fileName: String = "none"; // 現在のファイル名
	private _nowFileNum: number = 0; // 現在操作するファイルの番号

	private _assenblyStrNum: Array<number> = []; // 各ファイルごとの文字数
	private _assenblyLineNum: Array<number> = []; // 各ファイルごとの行数
	private _assenblyFileName: Array<String> = []; // 各ファイルの名前

	public updateCount(){
		let editor = vscode.window.activeTextEditor; // 現在開いているエディタ情報を格納
		if(!editor){ // "editor"がundefinedである場合
			return;
		}

		let document = editor?.document; // editorのドキュメント


		this._stringNum = this.getNumChar(document); // 文字数を更新
		this._lineNum = document.lineCount; // 行数を更新
		this._fileName = document.fileName; // ファイル名を更新

		// assenbly内にdocumentのファイルがあるかどうか
		if(this.searchFileName(this._fileName)){
			this._assenblyStrNum[this._nowFileNum] = this._stringNum; // 文字数を更新
			this._assenblyLineNum[this._nowFileNum] = this._lineNum; // 行数を更新
		}
		else{
			this._assenblyStrNum.push(this._stringNum); // 文字数を新たに追加
			this._assenblyLineNum.push(this._lineNum); // 行数を新たに追加
			this._assenblyFileName.push(this._fileName); // ファイル名を新たに追加

			this._nowFileNum = this._assenblyFileName.length - 1; // 現在のファイルを更新
		}

		console.log(this._fileName + "..." + "charactors:" + this._stringNum + " lines:" + this._lineNum); // コンソールに現在のファイルの情報を追加

	}

	/* 引数であるドキュメントの文字数を返すメソッド
		引数 document (vscode.TextDocument型)
		返り値 strNum (number型) ... 文字数
	*/
	public getNumChar(document: vscode.TextDocument): number {
		let strDoc = document.getText(); // ドキュメントの文字をString型で所得
		let strNum : number = 0; // 文字数を格納するnumber型の変数

		strDoc = strDoc.replace(/\s/g, ''); // 全ての空白を消す(正規表現 \s:空白, オプション  g:文字列全体)

		if(strDoc !== ""){
			strNum = strDoc.length; // strDocの文字数をstrNumに格納
		}

		return strNum;
	}

	/*
		引数にファイル名が格納されていれば，そのファイルの文字数を，
		格納されて居なければ全てのファイルの合計文字数を返す
		引数 name(String型)...ファイル名
		返り値 number(number型)...文字数
	*/
	public returnStrNum(name?: String): number{
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < this._assenblyFileName.length; i++){
				sum += this._assenblyStrNum[i]; // i の時のassenblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			if(this.searchFileName(name)){
				number = this._assenblyStrNum[this._nowFileNum];
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/*
		引数のファイル名と同じファイル名が格納されているかを確認し格納されていればtrue
		格納されていなければfalseを返すメソッド
		引数 name(String型) ... ファイル名
		返り値 (boolean型)
	*/
	private searchFileName(name: String): boolean{
		for(let i = 0; i < this._assenblyFileName.length; i++){
			// iの時の_assenblyFileNameとnameが一致する時
			if(name === this._assenblyFileName[i]){
				this._nowFileNum = i; // 現在のファイルの場所を格納
				return true; // trueを返す
			}
		}

		return false; // falseを返す
	}
}

class CharCountController{

}
// this method is called when your extension is deactivated
export function deactivate() {}
