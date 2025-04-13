// /functions/detectTextFromImage.js
import { ImageAnnotatorClient } from "@google-cloud/vision";
import dotenv from "dotenv";
dotenv.config();

const client = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
});

export async function detectTextFromImage(base64Data) {
  try {
    const [result] = await client.textDetection({
      image: {
        content: base64Data, // base64の文字列だけを渡す（プレフィックス除く）
      },
    });
    const textAnnotations = result.textAnnotations;

    // 画像からテキストが検出されると、最初の要素に全文が入る
    if (textAnnotations.length > 0) {
      return textAnnotations[0].description; // 最初のテキストを返す
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error detecting text:", error);
    throw error;
  }
}
