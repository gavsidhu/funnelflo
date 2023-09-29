import session from "express-session";

interface SessionOptions extends session.SessionOptions {
  resave: boolean;
  saveUninitialized: boolean;
}

export interface FunnelFloOptions {
  mainFunnelsDir?: string;
  sessionOptions: SessionOptions;
  viewEngine?: string;
}
