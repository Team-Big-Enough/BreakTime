import * as fs from 'fs';
import * as vscode from 'vscode';
import count = require('./count'); // count.tsにある文字数カウントクラスなどをインポート
const date = new Date().toLocaleString('sv').replace(/\D/g, ''); // スウェーデン語のフォーマットYYYY-MM-DD HH:MM:SSをreplaceにてYYYYMMDDHHMMSSに置き換え

/**
 * 所得したデータを扱うクラス
 */
export class Data{

    private static _context : vscode.ExtensionContext;
    private static _filename : string[]; // globalStorageへファイル名の書き込みをするときに必要なファイル名をまとめたフィールド
    private static _buffer:Buffer; // globalStorage から取り出したデータをまとめて一時的に格納するフィールド

    private _dataBeforeConvert: string = "none"; // 変換前の取り出したデータ
    private _date: Array<number> = []; // 日付のデータ
    private _timestamp: Array<number> = []; // タイムスタンプ
    private _fileName: Array<string> = []; // ファイル名
    private _strNum: Array<number> = []; // 文字数
    private _question: Array<number> = []; // "?"がある位置
    private _backslashN: Array<number> = []; // 改行がある位置("\n"がある位置)
    private _arrayBeforeConvert: Array<string> = [];
    private _mixtureData: Array<string> = [];

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
    public dataInput(contents:count.CharCount) : void{
        Data._filename = contents.returnFileName(); // まとめてファイル名を受け取る

        let temp = new Date();
        let timestamp = temp.getTime();

        for(let i = 0; i < Data._filename.length; i++){
            // globalStorageに保存する文字列の作成
            // splitメソッド
            let input:string = timestamp.toString() // タイムスタンプ(ミリ秒, 13桁)
                                + "?" // 区切り文字
                                + Data._filename[i] // ファイル名
                                + "?" // ファイル名と文字数の境目をわかりやすくする
                                + contents.returnStrNum(Data._filename[i]).toString() // 文字数
                                + "?" // 区切り文字
                                + "\n" // 改行
                                + "?"
                                ;
            
            if(i === 0){
                fs.writeFileSync(Data._context.globalStorageUri.fsPath, input); // ファイルを上書き(リセットしてから書き込み)
            }
            else{
                fs.appendFileSync(Data._context.globalStorageUri.fsPath, input); // 追加書き込み
            }
            

            //fs.appendFileSync(Data._context.globalStorageUri.fsPath, output); // ファイルに追加書き込みする
            console.log(input);
        } // 000000000?undifined-1?234

    }
    
    /**
     * データを取り出すメソッド
     */
    public dataOutput(){
        Data._buffer = fs.readFileSync(Data._context.globalStorageUri.fsPath); // globalStorage内のデータすべてを取り出す
        //console.log(Buffer.from(Data._buffer).toString());

        // 読み込んだデータを扱いやすい型で分けて格納する
        this._dataConvert();

        for(let i = 0; i < this._fileName.length; i++){
            console.log("file name: " + this._fileName[i] + " num of string:" + this._strNum[i] + " stamp:" + this._timestamp[i]);
        }
    }

    /**
     * 読み込んだデータを変換するメソッド
     */
    private _dataConvert():void{
        this._dataBeforeConvert = Buffer.from(Data._buffer).toString(); // String型に変換したバッファのデータを格納

        this._mixtureData = this._dataBeforeConvert.split("?");
        //console.log("dou :" + this._mixtureData[3] + "fow:" + this._mixtureData[4]);

        for(let i = 0; 4 * i < this._mixtureData.length - 1; i++){
            this._timestamp[i] = parseInt(this._mixtureData[4 * i]);
            this._fileName[i] = this._mixtureData[4 * i + 1];
            this._strNum[i] = parseInt(this._mixtureData[4 * i + 2]);

            console.log("time stamp:" + this._timestamp[i] + " file:" + this._fileName[i] + " number string:" + this._strNum[i]);
        }
        
    }

}

