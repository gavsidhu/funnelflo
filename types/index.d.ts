export * from "./FunnelConfig";
export * from "./FunnelFlo";
export * from "./Handlers";

import { Request } from "express";
import { SessionData } from "express-session";

declare module "express" {
  export interface Request {
    session: SessionData;
    [key: string]: any;
  }
}

declare module "express-session" {
  interface SessionData {
    [key: string]: any;
  }
}
