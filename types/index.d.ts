export * from "./FunnelConfig";
export * from "./FunnelFlo";
export * from "./Handlers";

import {
  Request,
  Response,
  NextFunction,
  Application,
  RequestHandler,
} from "express";
import { SessionData } from "express-session";

declare module "express" {
  export interface Request {
    session: SessionData;
    [key: string]: any;
  }
}

export interface Request extends Request {}
export interface Response extends Response {}
export interface NextFunction extends NextFunction {}
export interface Application extends Application {}
export interface RequestHandler extends Request {}

declare module "express-session" {
  interface SessionData {
    [key: string]: any;
  }
}
