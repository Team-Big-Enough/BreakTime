import * as vscode from 'vscode';
import count = require('./count/count'); // count.tsにある文字数カウントクラスなどをインポート
import globalData = require("./count/controlData");

const MINITES = 0;
const SECONDS = 2;
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-breaktime" is now active!');

	let charCount = new count.CharCount();
	let countEventCont = new count.CountEventController(charCount);
	let data = new globalData.Data(context);

	setTimer(MINITES, SECONDS, true);

	// リソース解放
	context.subscriptions.push(countEventCont);

}

// this method is called when your extension is deactivated
export function deactivate() {

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
function clearTimer(id: NodeJS.Timer, stateFlag: boolean){	//, input: globalData.Data, content: count.CharCount
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

                // input.dataInput(content);   // データをglobalStorageに格納する
											   // 要相談(構造的にsetTimerの引数にもinput, contentが必要になる	
											   // 		 都度インスタンスの生成でもいい？)

                // ビューの表示
            }else{ setTimer(MINITES, SECONDS, true); }  // 休憩せずに作業を続ける
        }else{ 
            if(value?.isCloseAffordance){
                setTimer(MINITES, SECONDS, true);       // 作業する
            }else{
                setTimer(MINITES, SECONDS, false);      // 作業せずに休憩を続ける
                // ビューの表示
            }
        }
	});
}
	// webviewはローカルリソースに直接アクセスできないらしい
	// 読み込みたいときはWebview.asWebviewUri関数を使って、読み込める形に変換しないといけない
	// https://code.visualstudio.com/api/extension-guides/webview#loading-local-content
	// Create and show a new webview
	// const panell = vscode.window.createWebviewPanel(
	// 	'Graph', // Identifies the type of the webview. Used internally
	// 	'test area', // Title of the panel displayed to the user
	// 	vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
	// 	{enableScripts: true} // Webview options. More on these later.
	// );

	// const graphPath = vscode.Uri.file(
	// 	path.join(context.extensionPath, 'src', 'graph.js')
	// );
	// const graphSrc = panell.webview.asWebviewUri(graphPath);

	// panell.webview.html = getWebviewContents(graphSrc);


function getWebviewContents(graphSrc: vscode.Uri){
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
