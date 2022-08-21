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
            let input:string = timestamp.toString() // タイムスタンプ(ミリ秒, 13桁)
                                + Data._filename[i] // ファイル名
                                + "?" // ファイル名と文字数の境目をわかりやすくする
                                + contents.returnStrNum(Data._filename[i]).toString() // 文字数
                                + "\n" // 改行
                                ;
            
            fs.writeFileSync(Data._context.globalStorageUri.fsPath, input); // ファイルを上書き(リセットしてから書き込み)

            //fs.appendFileSync(Data._context.globalStorageUri.fsPath, output); // ファイルに追加書き込みする
            console.log(input);
        }
    }
    
    public dataOutput(){
        Data._buffer = fs.readFileSync(Data._context.globalStorageUri.fsPath); // globalStorage内のデータすべてを取り出す
        //console.log(Buffer.from(Data._buffer).toString());
    }

    private _dataConvert():void{
        this._dataBeforeConvert = Buffer.from(Data._buffer).toString(); // String型に変換したバッファのデータを格納

        
        /*
        for(let i = 0; this._date[i-1] != null; i++){
            this._date[i] = parseInt(this._dataBeforeConvert.slice(0, 12)); // 先頭13文字分のデータを_dateに格納(for用に改良する必要性あり)
        }
        */
    }

    /**
     * "?"の位置をすべて検索するメソッド
     * @param {string} data 探したいデータ
     */
    private _searchQuestion(data: string): void{
        for(let beforeQ = 0, i = 0; beforeQ !== -1; i++){
            beforeQ = data.indexOf("?", beforeQ);

            if(beforeQ !== -1){
                this._question[i] = beforeQ; // "?"がある場所を格納
            }
        }
    }

    /**
     * "\n"をすべて検索するメソッド
     * @param {string} data 探したいデータ
     */
    private _searchBackslashN(data: string): void{
        for(let beforeN = 0, i = 0; beforeN !== -1; i++){
            beforeN = data.indexOf("\n", beforeN);

            if(beforeN !== -1){
                this._backslashN[i] = beforeN; // "?"がある場所を格納
            }
        }
    }
    
    private _pickUpTimeStampData(data: string): void{
        this._timestamp[0] = parseInt(data.slice(0, 13)); // 最初の13文字分を格納

        for(let i = 0; this._backslashN.includes(i); i++){
            this._timestamp[i + 1] = parseInt(data.slice(this._backslashN[i] + 2, this._backslashN[i] + 2 + 13)); // "\n"の後の13文字分をタイムスタンプのものとして格納する
        }
    }
}

