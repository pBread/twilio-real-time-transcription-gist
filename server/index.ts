import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import path from "path";
import { generateSyncToken } from "./sync";
import type { CallStatus } from "./twilio-types";

dotenv.config();

const { HOSTNAME } = process.env;

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
          <Transcription
            track="both_tracks"
            statusCallbackUrl="https://${HOSTNAME}/transcript-status-callback"
            name="real-time-transcript"
            partialResults="true"
          />
        </Start>

        <Say> Hello, this is a real-time transcription demo. Please speak </Say>
        <Connect>
            <Stream url="wss://${HOSTNAME}/media-stream/${CallSid}" />
        </Connect>
      </Response>
      `);
});

app.post("/call-status-update", async (req, res) => {
  const status = req.body.CallStatus as CallStatus;

  console.log(`/call-status-update ${status}`);

  res.status(200).send();
});

// a websocket is established simply to keep the call open
// in a real implementation, you would connect the caller to an agent or whatever
app.ws("/media-stream/:callSid", (ws) => {
  console.log("incoming websocket");

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.event === "media") return;
    console.log(`media stream event: ${msg.event}`);
  });
});

/****************************************************
 Sync 
****************************************************/
app.use("/sync/:identity", async (req, res) => {
  res.send(generateSyncToken(req.params.identity ?? "user"));
});

/****************************************************
 Serve UI
****************************************************/
app.use(express.static(path.join(__dirname, "../", "ui")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "index.html"));
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
