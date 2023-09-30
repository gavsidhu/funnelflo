import session from "express-session";

interface SessionOptions {
  secret: string | string[];
  genid?: (req: express.Request) => string;
  name?: string;
  store?: Store;
  cookie?: CookieOptions;
  rolling?: boolean;
  resave: boolean;
  proxy?: boolean;
  saveUninitialized: boolean;
  unset: "destroy" | "keep";
}

export interface FunnelFloOptions {
  mainFunnelsDir?: string;
  sessionOptions: SessionOptions;
  viewEngine?: string;
}
