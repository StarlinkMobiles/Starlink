import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Run M-Pesa STK Push
app.post("/api/runPrompt", async (req, res) => {
  const { phone, amount, local_id, transaction_desc } = req.body;

  if (!phone || !amount || !local_id) {
    return res.status(400).json({ status: false, msg: "Missing required fields" });
  }

  try {
    const nestRes = await fetch("https://api.nestlink.co.ke/runPrompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Secret": process.env.NESTLINK_API_KEY, // from your .env
      },
      body: JSON.stringify({
        phone,
        amount,
        local_id,
        transaction_desc,
      }),
    });

    const data = await nestRes.json(); // << correctly get response
    console.log("NestLink response:", data);

    // Send status to frontend
    if (data.status) {
      return res.json({ status: true, msg: "STK Push sent", data });
    } else {
      return res.json({ status: false, msg: "Payment failed", data });
    }
  } catch (err) {
    console.error("Error calling NestLink:", err);
    return res.status(500).json({ status: false, msg: "Server error", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
})