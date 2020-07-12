// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const dialogflow = require("dialogflow");
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

// Dialogflowのクライアントインスタンスを作成
const session_client = new dialogflow.SessionsClient({
	project_id: process.env.GOOGLE_PROJECT_ID,
	credentials: {
		client_email: process.env.GOOGLE_CLIENT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
	}
});
// -----------------------------------------------------------------------------
// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
	res.sendStatus(200);

	let events_processed = [];

	req.body.events.forEach((event) => {
		if (event.type == "message" && event.message.type == "text") {
			
			events_processed.push(
				session_client.detectIntent({
					session: session_client.sessionPath(process.env.GOOGLE_PROJECT_ID, event.source.userId),
					queryInput: {
						text: {
							text: event.message.text,
							languageCode: "ja",
						}
					}
				}).then((responses) => {
					if (responses[0].queryResult && responses[0].queryResult.action == "handle-delivery-order") {
						let message_text
						if (responses[0].queryResult.parameters.fields.menu.stringValue) {
							message_text = `毎度！${responses[0].queryResult.parameters.fields.menu.stringValue}ね。どちらにお届けしましょ？`;
						} else {
							message_text = `毎度！ご注文は？`;
						}
						return bot.replyMessage(event.replyToken, {
							type: "text",
							text: message_text
						});
					}
				})
			);
		}
	});


	Promise.all(events_processed).then(
		(response) => {
			console.log(`${response.length} event(s) processed.`);
		}
	);
});

