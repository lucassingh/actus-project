import { Inngest } from "inngest";

// Reads INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY from the environment automatically.
// Local dev runs against the Inngest dev server (INNGEST_DEV=1), which needs no keys.
export const inngest = new Inngest({ id: "actus" });
