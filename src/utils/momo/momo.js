import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getMoMoToken } from "./momoToken.js";

/**
 * Initiates a MoMo payment using the Collection API.
 * @param {string} phone - User's MoMo phone number (MSISDN format, e.g. 233XXXXXXXXX).
 * @param {string} amount - Amount to be paid (string or number).
 * @param {string} bookingId - An external booking ID to link the payment to.
 */
const initiatePayment = async (phone, amount, bookingId) => {
  const referenceId = uuidv4();
  const accessToken = await getMoMoToken(); // 🪄 Here's the dynamic part

  const momoRequest = {
    amount: String(amount),
    currency: "GHS",
    externalId: bookingId,
    payer: {
      partyIdType: "MSISDN",
      partyId: phone,
    },
    payerMessage: "Booking Payment",
    payeeNote: "Shuttle System",
  };

  const headers = {
    "X-Reference-Id": referenceId,
    "X-Target-Environment": "sandbox",
    "Ocp-Apim-Subscription-Key": process.env.MOMO_SUB_KEY,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
      momoRequest,
      { headers },
    );

    console.log("Payment initiated successfully");
    return { success: true, referenceId };
  } catch (err) {
    console.error("MoMo error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
};
export default initiatePayment;
