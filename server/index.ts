import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import type { CallStatus } from "./twilio-types";

dotenv.config();

const { HOSTNAME } = process.env;

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

// phone number incoming call webhook
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

// phone number status callback webhook
app.post("/call-status-update", async (req, res) => {
  const status = req.body.CallStatus as CallStatus;

  console.log(`/call-status-update ${status}`);

  res.status(200).send();
});

// transcription event handler
app.use(`/transcript-status-callback`, async (req, res) => {
  console.log(`/transcript-status-callback`, req.body);

  res.status(200).send();
});

// media stream handler
// note: this is only here to keep the call open. in a real implementation, you would connect the caller to an agent or whatever
app.ws("/media-stream/:callSid", (ws) => {
  console.log("incoming websocket");

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.event === "media") return;
    console.log(`media stream event: ${msg.event}`);
  });
});

// start
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
