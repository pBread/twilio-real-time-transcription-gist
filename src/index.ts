import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import type { CallStatus } from "./twilio-types";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Twilio Voice Webhooks
****************************************************/
app.use("/incoming-call", async (req, res) => {
  console.log("/incoming-call", req.body);

  const CallSid = req.body.CallSid as string;

  res.status(200);
  res.type("text/xml");

  // start transcription service
  // say hello
  // connect the call to a media stream so the call stays open

  res.end(`
      <Response>
        <Start>
          <Transcription track="both_tracks" statusCallbackUrl="https://${process.env.HOSTNAME}/transcript-status-callback" name="real-time-transcript" > </Transcription>
        </Start>
        
        <Say> Hello, this is a real-time transcription demo. Please speak </Say>
        <Connect>
            <Stream url="wss://${process.env.HOSTNAME}/media-stream/${CallSid}" />
        </Connect>
      </Response>
      `);
});

app.post("/call-status-update", async (req, res) => {
  const status = req.body.CallStatus as CallStatus;

  console.log(`/call-status-update ${status}`);

  res.status(200).send();
});

app.post("/primary-handler-fails", async (req, res) => {
  console.log(`/primary-handler-fails`, req.body);

  res.status(200).send();
});

app.ws("/media-stream/:callSid", (ws, req) => {
  console.log("incoming websocket");

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.event === "media") return;

    console.log(msg.event);
  });
});

/****************************************************
 Transcription Handler
****************************************************/
app.use(`/transcript-status-callback`, async (req, res) => {
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
