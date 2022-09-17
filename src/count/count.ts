import * as vscode from 'vscode';
import controlData = require("./controlData");

// 文字をカウントするクラス
export class CharCount{
	private _stringNum: number = 0; // 現在の文字数
	private _lineNum: number = 0; // 現在の行数
	private _fileName: string | undefined; // 現在のファイル名
	private _nowFileNum: number = 0; // 現在操作するファイルの番号

	private static _assemblyStrNum: Array<number> = []; // 各ファイルごとの文字数
	private static _assemblyLineNum: Array<number> = []; // 各ファイルごとの行数
	private static _assemblyFileName: Array<string> = []; // 各ファイルの名前

	private static _allHistory = new controlData.DataEachDay(); // 過去の休憩のデータをすべてまとめたもの(文字数差分管理用)

	constructor(){
		this.updateCount(); // エディタ情報を更新
	}

	/**
	 * エディタ情報を更新するメソッド
	 */
	public updateCount():void{
		let editor = vscode.window.activeTextEditor; // 現在開いているエディタ情報を格納
		if(!editor){ // "editor"がundefinedである場合
			return;
		}

		let document = editor.document; // editorのドキュメント


		this._stringNum = this.getNumChar(document); // 文字数を更新
		this._lineNum = document.lineCount; // 行数を更新
		this._fileName = document.fileName; // ファイル名を更新

		if(!this._fileName){
			return;
		}

		// assembly内にdocumentのファイルがあるかどうか
		if(this._searchFileName(this._fileName)){
			CharCount._assemblyStrNum[this._nowFileNum] = this._stringNum; // 文字数を更新
			CharCount._assemblyLineNum[this._nowFileNum] = this._lineNum; // 行数を更新
		}
		else{
			CharCount._assemblyStrNum.push(this._stringNum); // 文字数を新たに追加
			CharCount._assemblyLineNum.push(this._lineNum); // 行数を新たに追加
			CharCount._assemblyFileName.push(this._fileName); // ファイル名を新たに追加

			this._nowFileNum = CharCount._assemblyFileName.length - 1; // 現在のファイルを更新
		}

	}

	/**
	 * 差分所得用のメソッド
	 * @param {controlData.Data} history globalStorageに格納された過去のデータがまとまったもの
	 */
	public updateHistory(history: controlData.Data): void{
		let gon = new Date(); // 現在の日付を所得
		CharCount._allHistory.timeStamp[0] = gon.getTime(); // タイムスタンプを格納

		for(let i = 0; i < CharCount._assemblyFileName.length; i++){
			if(this.searchHistory(CharCount._assemblyFileName[i])){ // _allHistory内に格納されているファイル名であれば
				CharCount._allHistory.numOfStr[this._nowFileNum] = CharCount._assemblyStrNum[i]; // 文字数を更新
				CharCount._allHistory.numOfLin[this._nowFileNum] = CharCount._assemblyLineNum[i]; // 行数を更新
			}
			else{
				CharCount._allHistory.filename.push(CharCount._assemblyFileName[i]); // ファイル名を新たに追加
				CharCount._allHistory.numOfStr.push(CharCount._assemblyStrNum[i]); // 文字数を新たに追加
				CharCount._allHistory.numOfLin.push(CharCount._assemblyLineNum[i]); // 行数を新たに追加
			}
		}

		let historyFileName = history.returnOutputFileName(); // Data内のファイル名を取り出す
		let historyNumOfString = history.returnNumOfString(); // Data内の文字数を取り出す
		let historyNumOfLine = history.returnNumOfLine(); // Data内の行数を取り出す 
		for(let i = 0; i < historyFileName.length; i++){ // _allHistory内にDataのファイル名があるならば
			if(this.searchHistory(historyFileName[i])){
				CharCount._allHistory.numOfStr[this._nowFileNum] = historyNumOfString[i]; // 文字数を更新
				CharCount._allHistory.numOfLin[this._nowFileNum] = historyNumOfLine[i]; // 行数を更新
			}
			else{
				CharCount._allHistory.filename.push(historyFileName[i]); // ファイル名を新たに追加
				CharCount._allHistory.numOfStr.push(historyNumOfString[i]); // 文字数を新たに追加
				CharCount._allHistory.numOfLin.push(historyNumOfLine[i]); // 行数を新たに追加
			}
		}
	}

	/**
	 * window単位で操作が移った場合に_allHistoryに記録されていないか確認するメソッド.
	 * 記録されていない場合は新たに_allHistoryに追加する
	 * @returns {void} vscode.window.activeEditorがundefinedの時何も動作しない
	 */
	public checkHistoryAtWindow(): void{
		let editor = vscode.window.activeTextEditor;
		if(!editor){ // "editor"がundefinedである場合
			return;
		}
		let document = editor.document;

		// _allHistory内に現在選択しているファイルが記録されていない場合
		if(!this.searchHistory(document.fileName)){
			CharCount._allHistory.filename.push(document.fileName); // ファイル名を新たに追加
			CharCount._allHistory.numOfStr.push(this.getNumChar(document)); // 文字数を新たに追加
			CharCount._allHistory.numOfLin.push(document.lineCount); // 行数を新たに追加
			console.log("new file edit");
		}
	}

	/**
	 * 引数であるドキュメントの文字数を返すメソッド
	 * @param {vscode.TextDocument} document 
	 * @returns {number}  文字数
	 */
	private getNumChar(document: vscode.TextDocument): number {
		let strDoc = document.getText(); // ドキュメントの文字をString型で所得
		let strNum : number = 0; // 文字数を格納するnumber型の変数

		strDoc = strDoc.replace(/\s/g, ''); // 全ての空白を消す(正規表現 \s:空白, オプション  g:文字列全体)

		if(strDoc !== ""){
			strNum = strDoc.length; // strDocの文字数をstrNumに格納
		}

		return strNum;
	}

	/**
	 * _allHistoryに記録されている前回の文字数をもとに今回の編集したファイルの文字数との差を返すメソッド
	 * @returns {number} 各編集を行ったファイルの文字数の差分の合計値
	 */
	public calculateDiffStr(): number{
		let sum: number = 0; // 合計値
		
		for(let i = 0; i < CharCount._assemblyFileName.length; i++){
			if(this.searchHistory(CharCount._assemblyFileName[i])){ // _allHistory内に前回のもの記録されているならば
				sum += CharCount._assemblyStrNum[i] - CharCount._allHistory.numOfStr[this._nowFileNum]; // 差をsumに足し合わせる
			}
		}

		return sum;
	}

	/**
	 * _allHistoryに記録されている前回の行数をもとに今回の編集したファイルの行数との差を返すメソッド
	 * @returns {number} 各編集を行ったファイルの行数の差分の合計値
	 */
	public calculateDiffLin(): number{
		let sum: number = 0; // 合計値
		
		for(let i = 0; i < CharCount._assemblyFileName.length; i++){
			if(this.searchHistory(CharCount._assemblyFileName[i])){ // _allHistory内に前回のもの記録されているならば
				console.log(CharCount._assemblyLineNum[i] + "-" + CharCount._allHistory.numOfLin[this._nowFileNum]);
				sum += CharCount._assemblyLineNum[i] - CharCount._allHistory.numOfLin[this._nowFileNum]; // 差をsumに足し合わせる
			}
		}

		return sum;
	}

	/**
	 * 引数にファイル名が格納されていれば，そのファイルの文字数を，
	 * 格納されて居なければ全てのファイルの合計文字数を返す
	 * @param {string} name ファイル名
	 * @returns {number} 文字数
	 */
	public returnStrNum(name?: string): number{
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < CharCount._assemblyFileName.length; i++){
				sum += CharCount._assemblyStrNum[i]; // i の時のassemblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			// 引数のファイル名のものが記録されているかどうか
			if(this._searchFileName(name)){
				number = CharCount._assemblyStrNum[this._nowFileNum]; // あればnumberにその文字数を格納
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/**
	 * 引数にファイル名が格納されていれば，そのファイルの行数を，
	 * 格納されて居なければ全てのファイルの合計行数を返す.
	 * @param {string} name ファイル名
	 * @returns {number} 文字数
	 */
	public returnLineNum(name?: string):number{
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < CharCount._assemblyFileName.length; i++){
				sum += CharCount._assemblyLineNum[i]; // i の時のassemblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			// 引数のファイル名のものが記録されているかどうか
			if(this._searchFileName(name)){
				number = CharCount._assemblyLineNum[this._nowFileNum]; //あればnumberにその行数を格納
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/**
	 * ファイル名をまとめて返すメソッド
	 * @returns {string[]}ファイル名の集合
	 */
	public returnFileName(): string[]{
		return CharCount._assemblyFileName;
	}

	/**
	 * _allHistoryを返すメソッド
	 * @returns {controlData.DataEachDay} _allHistory
	 */
	public returnHistory(): controlData.DataEachDay{
		return CharCount._allHistory;
	}

	/**
	 * _allHistory内にファイルが記録されている場合true，そうでない場合falseを返すメソッド
	 * @param {string} name ファイル名
	 * @returns {boolean} _allHistory内にファイルが記録されているか
	 */
	public searchHistory(name: string): boolean{
		for(let i = 0; i < CharCount._allHistory.filename.length; i++){
			if(name === CharCount._allHistory.filename[i]){
				this._nowFileNum = i;
				return true;
			}
		}

		return false;
	}

	/**
	 * 引数のファイル名と同じファイル名が格納されているかを確認し格納されていればtrue
	 * 格納されていなければfalseを返すメソッド
	 * @param {String} name ファイル名
	 * @returns {boolean} nameが格納されているかどうか
	 */
	private _searchFileName(name: string): boolean{
		for(let i = 0; i < CharCount._assemblyFileName.length; i++){
			// iの時の_assemblyFileNameとnameが一致する時
			if(name === CharCount._assemblyFileName[i]){
				this._nowFileNum = i; // 現在のファイルの場所を格納
				return true; // trueを返す
			}
		}

		return false; // falseを返す
	}
}

/**
 * 入力イベントを管理するクラス
 */
export class CountEventController{
	private _charCount: CharCount;
	private _disposable: vscode.Disposable;

	/**
	 * コンストラクタ:charCountを動作させる
	 * @param {CharCount} charCount 動作させるもの
	 */
	constructor(charCount: CharCount){
		this._charCount = charCount; // 引数のものを代入

		let subscriptions: vscode.Disposable[] = [];

		vscode.window.onDidChangeActiveTextEditor(this._onEventChangeFile, this, subscriptions); // エディタが移ると_onEventを動作
		vscode.window.onDidChangeVisibleTextEditors(this._onEventChangeFile, this, subscriptions); // エディタ分割の際に_onEventを動作
		vscode.window.onDidChangeWindowState(this._onEvent, this, subscriptions); // window単位のfocusが移ると_onEventChangeWindow
		vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions); // カーソル動くと動作
	

		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	/**
	 * 動作させたいものをまとめたメソッド
	 */
	private async _onEvent(){
		await this._charCount.updateCount();
	}

	/**
	 * windowのfocusが変わるとき動作させたいものをまとめたメソッド
	 */
	private async _onEventChangeFile(){
		await this._onEvent();
		await this._charCount.checkHistoryAtWindow(); // 差分抽出のための管理用の変数を更新
	}

	/**
	 * disposeのメソッド
	 */
	public dispose(){
		this._disposable.dispose();
	}
}
