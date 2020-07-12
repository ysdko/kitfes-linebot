// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
	channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
	channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
	res.sendStatus(200);

	let events_processed = [];

	req.body.events.forEach((event) => {
		if (event.type == "message" && event.message.type == "text") {
			
			if (event.message.text == "こんにちは") {
				events_processed.push(bot.replyMessage(event.replyToken, {
					type: "text",
					text: "これはこれは"
				}));
			}
		}
	});


	Promise.all(events_processed).then(
		(response) => {
			console.log(`${response.length} event(s) processed.`);
		}
	);
});

