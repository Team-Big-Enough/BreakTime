import * as fs from 'fs';
import * as vscode from 'vscode';
import count = require('./count'); // count.tsにある文字数カウントクラスなどをインポート
const date = new Date().toLocaleString('sv').replace(/\D/g, ''); // スウェーデン語のフォーマットYYYY-MM-DD HH:MM:SSをreplaceにてYYYYMMDDHHMMSSに置き換え

// 所得したデータを扱うクラス
export class Data{

    private static _context : vscode.ExtensionContext;
    private static _filename : String[];


    /**
     * コンストラクタ: 引数のExtensionContextをこのクラスに代入する
     * @param {vscode.ExtensionContext} context 
     */
    constructor(context: vscode.ExtensionContext){
		Data._context = context; // 引数のExtensionContextを格納
	}

    /**
     * 文字数などのデータをglobalStorageに書き込むメソッド
     * @param {count.CharCount} contents ファイル名や文字数などが格納されたフィールド
     */
    public dataOutput(contents:count.CharCount) : void{
        Data._filename = contents.returnFileName(); // まとめてファイル名を受け取る

        for(let i = 0; i < Data._filename.length; i++){
            // globalStorageに保存する文字列の作成
            let output:string = date // 14桁の数字列
                                + Data._filename[i] // ファイル名
                                + "?" // ファイル名と文字数の境目をわかりやすくする
                                + contents.returnStrNum(Data._filename[i]).toString() // 文字数
                                + "\n" // 改行
                                ;
            
            fs.writeFileSync(Data._context.globalStorageUri.fsPath, output); // ファイルを上書き(リセットしてから書き込み)

            //fs.appendFileSync(Data._context.globalStorageUri.fsPath, output); // 
            console.log(output);
        }
    }
    
    
    
}

