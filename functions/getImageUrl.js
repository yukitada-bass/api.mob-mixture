export async function getImageUrl(messageId, channelAccessToken) {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
    },
  });

  // 画像データをarrayBufferとして取得
  const arrayBuffer = await response.arrayBuffer();

  // base64エンコードして画像を返す
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  return base64Data;
}
