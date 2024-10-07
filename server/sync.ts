import { jwt } from "twilio";

const AccessToken = jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SERVICE_SID = "default",
} = process.env;

export function generateSyncToken(identity: string) {
  // Create an access token which we will sign and return to the client
  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET,
    { identity }
  );

  // Point to a particular Sync service, or use the account default Service
  const syncGrant = new SyncGrant({ serviceSid: TWILIO_SYNC_SERVICE_SID });
  token.addGrant(syncGrant);

  return { identity: token.identity, token: token.toJwt() };
}
