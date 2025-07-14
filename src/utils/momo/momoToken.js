import dotenv from "dotenv";
import axios from "axios";
import base64 from "base-64";

dotenv.config();

// This is to get the MoMo token
export const getMoMoToken = async () => {
  const MOMO_USER_ID = process.env.MOMO_USER_ID;
  const MOMO_API_KEY = process.env.MOMO_API_KEY;
  const MOMO_SUB_KEY = process.env.MOMO_SUB_KEY;

  const basicToken = base64.encode(`${MOMO_USER_ID}:${MOMO_API_KEY}`);

  const headers = {
    Authorization: `Basic ${basicToken}`,
    "Ocp-Apim-Subscription-Key": MOMO_SUB_KEY,
  };

  try {
    const res = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/collection/token/",
      null,
      { headers },
    );

    return res.data.access_token; // This is what you'll use in the Bearer token
  } catch (err) {
    console.error(
      "Failed to get MoMo token:",
      err.response?.data || err.message,
    );
    throw new Error("Could not authenticate with MoMo API");
  }
};
