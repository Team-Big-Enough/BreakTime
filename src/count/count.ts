import * as vscode from 'vscode'; //

// 文字をカウントするクラス
export class CharCount{
	private _stringNum: number = 0; // 現在の文字数
	private _lineNum: number = 0; // 現在の行数
	private _fileName: String = "none"; // 現在のファイル名
	private _nowFileNum: number = 0; // 現在操作するファイルの番号

	private _assemblyStrNum: Array<number> = []; // 各ファイルごとの文字数
	private _assemblyLineNum: Array<number> = []; // 各ファイルごとの行数
	private _assemblyFileName: Array<String> = []; // 各ファイルの名前

	/**	public
		エディタ情報を更新するメソッド
		引数 なし;
		返り値 なし
	 **/
	public updateCount(){
		let editor = vscode.window.activeTextEditor; // 現在開いているエディタ情報を格納
		if(!editor){ // "editor"がundefinedである場合
			return;
		}

		let document = editor?.document; // editorのドキュメント


		this._stringNum = this.getNumChar(document); // 文字数を更新
		this._lineNum = document.lineCount; // 行数を更新
		this._fileName = document.fileName; // ファイル名を更新

		// assembly内にdocumentのファイルがあるかどうか
		if(this.searchFileName(this._fileName)){
			this._assemblyStrNum[this._nowFileNum] = this._stringNum; // 文字数を更新
			this._assemblyLineNum[this._nowFileNum] = this._lineNum; // 行数を更新
		}
		else{
			this._assemblyStrNum.push(this._stringNum); // 文字数を新たに追加
			this._assemblyLineNum.push(this._lineNum); // 行数を新たに追加
			this._assemblyFileName.push(this._fileName); // ファイル名を新たに追加

			this._nowFileNum = this._assemblyFileName.length - 1; // 現在のファイルを更新
		}

		//console.log(this._fileName + " ..." + "characters:" + this._stringNum + " lines:" + this._lineNum); // コンソールに現在のファイルの情報を追加
		//console.log("sum//" + " characters: " + this.returnStrNum() + " lines" + this.returnLineNum());

	}

	/** private
		引数であるドキュメントの文字数を返すメソッド
		引数 document (vscode.TextDocument型);
		返り値 strNum (number型) ... 文字数
	**/
	private getNumChar(document: vscode.TextDocument): number {
		let strDoc = document.getText(); // ドキュメントの文字をString型で所得
		let strNum : number = 0; // 文字数を格納するnumber型の変数

		strDoc = strDoc.replace(/\s/g, ''); // 全ての空白を消す(正規表現 \s:空白, オプション  g:文字列全体)

		if(strDoc !== ""){
			strNum = strDoc.length; // strDocの文字数をstrNumに格納
		}

		return strNum;
	}

	/** public
		引数にファイル名が格納されていれば，そのファイルの文字数を，
		格納されて居なければ全てのファイルの合計文字数を返す
		引数 name(String型)...ファイル名;
		返り値 number(number型)...文字数
	**/
	public returnStrNum(name?: String): number{
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < this._assemblyFileName.length; i++){
				sum += this._assemblyStrNum[i]; // i の時のassemblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			// 引数のファイル名のものが記録されているかどうか
			if(this.searchFileName(name)){
				number = this._assemblyStrNum[this._nowFileNum];
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/** public
	 *	引数にファイル名が格納されていれば，そのファイルの行数を，
	 *	格納されて居なければ全てのファイルの合計行数を返す.
	 *	引数 name(String型)...ファイル名;
	 *	返り値 number(number型)...文字数
	**/
	public returnLineNum(name?: String){
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < this._assemblyFileName.length; i++){
				sum += this._assemblyLineNum[i]; // i の時のassemblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			// 引数のファイル名のものが記録されているかどうか
			if(this.searchFileName(name)){
				number = this._assemblyLineNum[this._nowFileNum];
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/**
	 * ファイル名をまとめて返すメソッド
	 * 返り値 (String[]型)
	 */
	public returnFileName(): String[]{
		return this._assemblyFileName;
	}

	/**	private
		引数のファイル名と同じファイル名が格納されているかを確認し格納されていればtrue
		格納されていなければfalseを返すメソッド
		引数 name(String型) ... ファイル名;
		返り値 (boolean型)
	**/
	private searchFileName(name: String): boolean{
		for(let i = 0; i < this._assemblyFileName.length; i++){
			// iの時の_assemblyFileNameとnameが一致する時
			if(name === this._assemblyFileName[i]){
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

	constructor(charCount: CharCount){
		this._charCount = charCount; // 引数のものを代入
		this._charCount.updateCount(); // エディタ情報を更新

		let subscriptions: vscode.Disposable[] = [];

		vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions); // エディタが移ると_onEventを動作
		vscode.window.onDidChangeVisibleTextEditors(this._onEvent, this, subscriptions); // エディタ分割の際に_onEventを動作
		vscode.window.onDidChangeWindowState(this._onEvent, this, subscriptions); // window単位のfocusが移ると_onEvent
		vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions); // カーソル動くと動作

		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	private _onEvent(){
		this._charCount.updateCount();
	}

	public dispose(){
		this._disposable.dispose();
	}
}
