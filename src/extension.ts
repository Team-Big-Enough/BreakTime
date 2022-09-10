// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { countReset } from 'console';
import * as typescript from 'typescript';
import * as vscode from 'vscode';
import * as path from 'path';
import count = require('./count/count'); // count.tsにある文字数カウントクラスなどをインポート
import globalData = require("./count/controlData");
import sidebar = require("./sidebar/sidebar_webview"); // サイドバー用のモジュール

const MINITES = 0; // m
const SECONDS = 10; // s
let graphPanel: any
let sumOfStr = 0;
let sumOfLine = 0;
let diffOfStr = new Array();
let diffOfLine = new Array();
let contextG: vscode.ExtensionContext; // deactivate用のExtensionContextを格納するフィールド

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	contextG = context;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-breaktime" is now active!');
	const progressViewProvider = new sidebar.ProgressView(context.extensionUri); // github の四角の集合のようなものの表示
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	setTimer(MINITES, SECONDS, true);
	// リソース解放
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("left-panel-webview", progressViewProvider));

}

// this method is called when your extension is deactivated (vscodeを閉じるときにも動作する)
export function deactivate() {
	console.log("deactivate");
	// 文字数カウントをアップデートさせる
	let charCount = new count.CharCount();
	charCount.updateCount();

	// 文字数のデータをglobalStorageに格納する
	let input = new globalData.Data(contextG);
	input.dataInput(charCount);
}

/**
 * ランダムに配列の中身を一つ返す
 * @param {Array<string>} array string型の配列
 * @return {string} 配列の中身
 */
function getRandomMessage(array: Array<string>): string{
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * 書式の桁数に満たない数値の場合に、0を追加して桁数を合わせる。
 * @param {number} num 値
 * @param {number} len 桁数
 * @returns {string} 指定された桁数に整形した文字列
 */
function zeroPadding(num: number, len: number): string{
	return ( Array(len).join('0') + num ).slice( -len );
}

/**
 * タイマー開始
 * @param {number} min 分数
 * @param {number} sec 秒数
 * @param {boolean | undefined} stateFlag 状態管理フラグ(true: 作業中, false: 休憩中)
 */
function setTimer(min: number, sec: number, stateFlag: boolean){
	const text = stateFlag
		? '残り作業時間 '
		: '残り休憩時間 ';

	const id = setInterval(function(){
		vscode.window.setStatusBarMessage(
			text+zeroPadding(min, 2)+':'+zeroPadding(sec--, 2));
		if(sec === -1){
			min--;
			sec = 59;
		}

		min === -1? clearTimer(id, stateFlag): '';
	}, 1000);
}

/**
 * タイマー終了
 * @param {NodeJS.Timer} id タイマーID
 * @param {boolean} stateFlag 状態管理フラグ（）
 */
function clearTimer(id: NodeJS.Timer, stateFlag: boolean){
	// メッセージを考える
	const breakMessage: Array<string> = [
		'休憩してください。1',
		'休憩してください。2',
		'休憩してください。3',
		'休憩してください。4',
	];
	const workMessage: Array<string> = [
		'作業を開始してください。1',
		'作業を開始してください。2',
		'作業を開始してください。3',
		'作業を開始してください。4',
	];
	const message: string = stateFlag
		? getRandomMessage(breakMessage)
		: getRandomMessage(workMessage);

	clearInterval(id);
	const window = vscode.window.showInformationMessage(
		message, { modal: true },
		{ title: 'いいえ', isCloseAffordance: false },
		{ title: 'はい', isCloseAffordance: true }
	);


	window.then((value) => {
		if(stateFlag){
			if(value?.isCloseAffordance){
				setTimer(MINITES, SECONDS, false);      // 休憩する

				let input = new globalData.Data(contextG);
				let charCount = new count.CharCount();
				let countEventCont = new count.CountEventController(charCount);
				contextG.subscriptions.push(countEventCont);
				input.dataInput(charCount);	// globalStorageに格納する

				// 前回休憩時の文字数と今回の休憩までの文字数の差分を取得
				let strNum = input.returnNumOfString().slice(-1)[0];
				if(diffOfStr.length > 5) {
					diffOfStr.shift();
				}
				diffOfStr.push(strNum-sumOfStr);
				sumOfStr = strNum;

				let strLine = charCount.returnLineNum();
				if(diffOfLine.length > 5) {
					diffOfLine.shift();
				}
				diffOfLine.push(strLine-sumOfLine);
				sumOfLine = strLine;

				// グラフの表示
				graphPanel = vscode.window.createWebviewPanel(
					'Graph', // Identifies the type of the webview. Used internally
					'test area', // Title of the panel displayed to the user
					vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
					{enableScripts: true} // Webview options. More on these later.
				);

				const graphPath = vscode.Uri.file(
					path.join(contextG.extensionPath, 'src', 'graph.js')
				);
				const graphSrc = graphPanel.webview.asWebviewUri(graphPath);
				graphPanel.webview.html = getWebviewContents(graphSrc, diffOfStr, diffOfLine);

			}else{
				setTimer(MINITES, SECONDS, true); // 休憩せずに作業を続ける
			}
    	}else{
			if(value?.isCloseAffordance){
				graphPanel.dispose();
				setTimer(MINITES, SECONDS, true);       // 作業する
			}else{
				setTimer(MINITES, SECONDS, false);      // 作業せずに休憩を続ける
			}
			}
		});
}

function getWebviewContents(graphSrc: vscode.Uri, diffOfStr: Array<number>, diffOfLine: Array<number>){
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>title</title>
	</head>
	<body>
		<h1>お疲れ様です！よく頑張りましたね👏</h1>
		<div>
			<canvas id="graph" width="100%"></canvas>
		</div>
		<script>
		var diffOfStr = `+  JSON.stringify(diffOfStr) +`;
		var diffOfLine = `+  JSON.stringify(diffOfLine) +`;
		</script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.js"></script>
		<script src=` + graphSrc + `></script>
	</body>
	</html>
	`;
}