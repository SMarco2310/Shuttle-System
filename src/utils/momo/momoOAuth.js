import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import base64 from "base-64";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

/**
 * Step 1: Automatically register a new MoMo user and get API key.
 */
const setupMomoCredentials = async () => {
  const subscriptionKey = process.env.MOMO_SUB_KEY;
  if (!subscriptionKey) {
    console.error("❌ Missing MOMO_SUB_KEY in .env");
    return;
  }

  const userId = uuidv4();
  const callbackHost = "https://dummy-callback.com";

  const headers = {
    "X-Reference-Id": userId,
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": subscriptionKey,
  };

  try {
    // 1. Create API User
    await axios.post(
      "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser",
      { providerCallbackHost: callbackHost },
      { headers },
    );
    console.log("✅ MoMo API User Created:", userId);

    // 2. Generate API Key
    const apiKeyRes = await axios.post(
      `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${userId}/apikey`,
      null,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
      },
    );

    const apiKey = apiKeyRes.data.apiKey;
    console.log("✅ MoMo API Key Generated");

    // 3. Save to .env (optional)
    const envPath = ".env";
    let env = fs.readFileSync(envPath, "utf8");

    env = env
      .split("\n")
      .filter(
        (line) =>
          !line.startsWith("MOMO_USER_ID") && !line.startsWith("MOMO_API_KEY"),
      )
      .concat([`MOMO_USER_ID=${userId}`, `MOMO_API_KEY=${apiKey}`])
      .join("\n");

    fs.writeFileSync(envPath, env);
    console.log("✅ .env file updated.");

    return { userId, apiKey };
  } catch (err) {
    console.error("❌ MoMo setup failed:", err.response?.data || err.message);
    throw err;
  }
};
