// "use strict";

// /** 
//  * Import Packages
//  */
// const server = require("express")();
// const bot_express = require("bot-express");

// /** 
//  * Middleware Configuration
//  */
// server.listen(process.env.PORT || 5000, () => {
//     console.log("server is running...");
// });

// /** 
//  * Mount bot-express
//  */

// server.use("/bot/webhook", bot_express({
//     language: "ja",
//     messenger: {
//         line: {
//             // channel_id: process.env.LINE_CHANNEL_ID,
//             // channel_secret: process.env.LINE_CHANNEL_SECRET
//             channel_id: '2f13a44596ce0204276a12c9f3d31630',
//             channel_secret: '7OTzSy6u/t52SwHF8NdvnLsKoDIds+GeR+vA17TvJggY+EyHyQdUvkBO2/yAJlwn+nYJpKnb9U6B9GKHhmfaj7r/DPfH5FgQylgDelu9khHEvHdDYmGD3dQEjZI0s83bn8YVOk0WH4sqnsXiDTdXkAdB04t89/1O/w1cDnyilFU='
//         }
//     },
//     nlu: {
//         type: "dialogflow",
//         options: {
//             project_id: process.env.GOOGLE_PROJECT_ID,
//             client_email: process.env.GOOGLE_CLIENT_EMAIL,
//             private_key: process.env.GOOGLE_PRIVATE_KEY,
//             language: "ja"
//         }
//     },
//     parser: [{
//         type: "dialogflow",
//         options: {
//             project_id: process.env.GOOGLE_PROJECT_ID,
//             client_email: process.env.GOOGLE_CLIENT_EMAIL,
//             private_key: process.env.GOOGLE_PRIVATE_KEY,
//             language: "ja"
//         }
//     }],
//     memory: {
//         type: process.env.MEMORY_TYPE || "memory-cache", // memory-cache | redis
//         retention: Number(process.env.MEMORY_RETENTION),
//         options: {
//             url: process.env.REDIS_URL
//         }
//     },
//     translator: {
//         type: "google",
//         enable_lang_detection: false,
//         enable_translation: false,
//         options: {
//             project_id: process.env.GOOGLE_PROJECT_ID,
//             client_email: process.env.GOOGLE_CLIENT_EMAIL,
//             private_key: process.env.GOOGLE_PRIVATE_KEY
//         }
//     },
//     logger: {
//         type: process.env.LOGGER_TYPE || "stdout", // stdout | firestore
//         options: { // Options for firestore.
//             project_id: process.env.FIREBASE_PROJECT_ID,
//             client_email: process.env.FIREBASE_CLIENT_EMAIL,
//             private_key: process.env.FIREBASE_PRIVATE_KEY,
//         }
//     },
//     skill: {
//         default: process.env.DEFAULT_SKILL
//     }
// }));

// module.exports = server;

const express = require('express'); // expressインポート
const app = express();
const line = require('@line/bot-sdk');// sdkインポート

const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセット
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセット
};
const client = new line.Client(config); // APIコールのためのクライアントインスタンスを作成

const port = process.env.PORT || 3000; // ポートを環境変数or3000で設定
app.listen(port, () => console.log(`Listening on port ${port}...`));

// WebHookのエンドポイント
app.post('/hook', line.middleware(config), (req, res) => lineBot(req, res));




const bangohanList = ["ミスコン", "ミスターコン"];

const hash = { 'ミスコン': '13:00', 'ミスターコン': '14:00'};
// line bot 本体
function lineBot(req, res) {
    res.status(200).end(); // すぐにLINE側にステータスコード200でレスポンス
    // チャットボットの処理をかいていく
    res.status(200).end(); // すぐにLINE側にステータスコード200でレスポンス
    const promises = []; // すべてのイベント処理のpromiseを格納する配列
    const events = req.body.events; // イベントオブジェクト

    // イベントオブジェクトを処理
    events.forEach((event) => {
        // イベントタイプが"message"で、typeが"text"だった場合
        if (event.type === "message" && event.message.type == "text") {
            // メッセージの内容が”晩ご飯”なら晩ご飯をレコメンドする
            if (event.message.text === "おすすめ") {
                const bangohan = bangohanList[Math.floor(Math.random() * bangohanList.length)];// 晩ご飯リストからランダムに要素を取得
                promises.push(client.replyMessage(event.replyToken, {
                    "type": "template",
                    "altText": "どっちがみたい？",
                    "template": {
                        "type": "buttons",
                        "text": `どっちがみたい？`,
                        "actions": [
                            // {
                            //     "type": "postback",
                            //     "label": "NO",
                            //     "data": JSON.stringify({ "action": "no" })
                            // },
                            {
                                "type": "postback",
                                "label": "展示",
                                "data": JSON.stringify({ "action": "tenzi" })
                            },
                            {
                                "type": "postback",
                                "label": "企画",
                                "data": JSON.stringify({ "action": "kikaku" })
                            }
                        ]
                    }
                }));
            }
        }
        // イベントタイプが"postback"だった場合
        else if (event.type === "postback") {
            // noボタンが押されていた場合
            if (JSON.parse(event.postback.data).action === "kikaku") {
                const list= bangohanList[Math.floor(Math.random() * bangohanList.length)];
                promises.push(client.replyMessage(event.replyToken, {
                    "type": "template",
                    "altText": "晩ご飯をレコメンドします",
                    "template": {
                        "type": "confirm",
                        "text": `それなら${list}はどう？`,
                        "actions": [
                            {
                                "type": "postback",
                                "label": "他がいい",
                                "data": JSON.stringify({ "action": "kikaku" })
                            },
                            {
                                "type": "message",
                                "label": "よき！",
                                "text": `13:00からです！たのしんで！`
                            
                            }
                        ]

                    }
                }));
            } else if (JSON.parse(event.postback.data).action === "tenzi") {
                promises.push(client.replyMessage(event.replyToken, {
                    "type": "template",
                    "altText": "おすすめ",
                    "template": {
                        "type": "buttons",
                        "text": `どっちがみたい`,
                        "actions": [
                            {
                                type: "messsage",
                                label: "サークル展示",
                                text: `13:00からです！楽しんで！`
                            },
                            {
                                type: "message",
                                label: "研究展示",
                                text: `14:00からです！楽しんで！`
                            },


                        ]
                    }
                }));
                
            }
        }
    });
    // 全プロミスを処理したらログを出力
    Promise.all(promises).then(console.log(`promise completed\n`));
}
