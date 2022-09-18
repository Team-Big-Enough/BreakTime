// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import * as path from 'path';
import count = require('./count/count'); // count.tsにある文字数カウントクラスなどをインポート
import globalData = require("./count/controlData");

const MINITES = 52; // m 作業時間 52m
const SECONDS = 0; // s 作業時間
const MINITESBREAK = 17; // minute 休憩時間 17m
const SECONDSBREAK = 0; // second 休憩時間
let graphPanel: any;
let diffOfStr = new Array();
let diffOfLine = new Array();
let contextG: vscode.ExtensionContext; // deactivate用のExtensionContextを格納するフィールド
let charCount = new count.CharCount();
let countEventCont = new count.CountEventController(charCount);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	contextG = context;

	context.subscriptions.push(countEventCont);
	let controlData = new globalData.Data(context);
	charCount.updateHistory(controlData);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-breaktime" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	setTimer(MINITES, SECONDS, true);
	// リソース解放

}

// this method is called when your extension is deactivated (vscodeを閉じるときにも動作する)
export function deactivate() {
	console.log("deactivate");

	/*--- 終了時に記録していた文字数のデータをglobalStorageに移す(a1 start) ---*/
	// 文字数カウントをアップデートさせる
	let charCount = new count.CharCount();
	charCount.updateCount();

	// 文字数のデータをglobalStorageに格納する
	let input = new globalData.Data(contextG);
	input.dataInput(charCount);
	/*--- (a1 finish) ---*/
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
		'休憩してください。',
		`お疲れ様です。
		休憩の時間になりました。`,
		`${MINITES}分経過しました。
		少し休憩しませんか?`,
		`お腹空いてませんか？`
		];
	const workMessage: Array<string> = [
		`休憩終了です！
		もう少し休みますか？`,

	];
	const message: string = stateFlag
		? getRandomMessage(breakMessage)
		: getRandomMessage(workMessage);

	clearInterval(id);
	const window = vscode.window.showInformationMessage(
		message, { modal: true },
		{ title: 'はい', isCloseAffordance: false },
		{ title: 'いいえ', isCloseAffordance: true },
	);


	window.then((value) => {
		if(stateFlag){
			if(!value?.isCloseAffordance){
				setTimer(MINITESBREAK, SECONDSBREAK, false);      // 休憩する

				let input = new globalData.Data(contextG);


				input.dataInput(charCount);	// globalStorageに格納する

				// 前回休憩時の文字数と今回の休憩までの文字数の差分を取得
				diffOfStr.push(charCount.calculateDiffStr());
				console.log(charCount.calculateDiffStr());
				console.log(charCount.returnHistory().filename);
				console.log("diff:" + diffOfStr[diffOfStr.length - 1]);

				if(diffOfStr.length > 5) { // 配列の長さが5より大きい場合5になるよう前のデータを消す
					diffOfStr.shift();
				}


				diffOfLine.push(charCount.calculateDiffLin());
				if(diffOfLine.length > 5) {
					diffOfLine.shift();
				}
				console.log("lineDiff:" + diffOfLine);


				// グラフの表示
				graphPanel = vscode.window.createWebviewPanel(
					'Graph', // Identifies the type of the webview. Used internally
					'test area', // Title of the panel displayed to the user
					vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
					{enableScripts: true} // Webview options. More on these later.
				);

				const graphPath = vscode.Uri.file(
					path.join(contextG.extensionPath, 'graph', 'graph.js')
				);
				const graphSrc = graphPanel.webview.asWebviewUri(graphPath);
				graphPanel.webview.html = getWebviewContents(graphSrc, diffOfStr, diffOfLine);

				charCount.updateHistory(input); // _allHistoryを更新し次の差分用の比較物を用意する
			}else{
				setTimer(MINITES, SECONDS, true); // 休憩せずに作業を続ける
			}
    	}else{
			if(value?.isCloseAffordance){
				graphPanel.dispose();
				setTimer(MINITES, SECONDS, true);       // 作業する
			}else{
				setTimer(MINITESBREAK, SECONDSBREAK, false);      // 作業せずに休憩を続ける
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