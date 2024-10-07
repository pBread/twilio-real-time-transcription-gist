import dotenv from "dotenv-flow";
import express from "express";
import type { CallStatus } from "./twilio-types";

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Twilio Voice Webhooks
****************************************************/
app.post("/incoming-call", async (req, res) => {
  res.status(200);
  res.type("text/xml");

  res.end(`
    <Response>
      <Connect>
        <Transcription statusCallbackUrl="https://${process.env.HOSTNAME}/transcript-status-callback"/> 
      </Connect>
    </Response>
    `);
});

app.post("/call-status-update", async (req, res) => {
  const status = req.body.CallStatus as CallStatus;

  console.log(`/call-status-update ${status}`);

  res.status(200).send();
});

/****************************************************
 Transcription Handler
****************************************************/
app.post(`/transcript-status-callback`, async (req, res) => {
  console.log(`/transcript-status-callback`, req.body);

  res.status(200).send();
});

/****************************************************
 Start Server
****************************************************/
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
