declare namespace NodeJS {
  export interface ProcessEnv {
    HOSTNAME: string;

    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;

    TWILIO_SYNC_SVC_SID: string;
    TWILIO_API_KEY: string;
    TWILIO_API_SECRET: string;
  }
}
