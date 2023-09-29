import express, {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import path from "path";
import fs from "fs";
import session from "express-session";
import { FunnelFloOptions } from "../types/FunnelFlo";
import { FunnelConfig, Route } from "../types/FunnelConfig";
import { HandlersModule } from "../types/Handlers";
import { isAsyncFunction } from "util/types";
import { FunnelConfigError, PrefixError } from "./Errors";

export class FunnelFlo {
  private app: Express;
  private mainFunnelsDir: string;
  private prefixes: string[] = [];
  private sessionOptions: session.SessionOptions;
  private viewEngine: string;

  constructor(options: FunnelFloOptions) {
    const {
      sessionOptions,
      mainFunnelsDir = "./funnels",
      viewEngine = "ejs",
    } = options;
    this.app = express();
    this.mainFunnelsDir = path.resolve(process.cwd(), mainFunnelsDir);
    this.sessionOptions = sessionOptions;
    this.viewEngine = viewEngine;

    this.setupMiddleware();
  }

  private getFunnelConfig(funnelDir: string): FunnelConfig {
    const funnelConfig: FunnelConfig = require(path.resolve(
      this.mainFunnelsDir,
      funnelDir,
      "funnelConfig.json"
    ));

    if (!funnelConfig) {
      throw new FunnelConfigError(
        `No funnel config file found for ${funnelDir}`
      );
    }

    if (!funnelConfig.prefix) {
      throw new PrefixError("Funnel prefix required");
    }

    if (this.prefixes.includes(funnelConfig.prefix)) {
      throw new PrefixError(
        `Prefix ${funnelConfig.prefix} is already in use. Please choose a different prefix for ${funnelDir}`
      );
    }

    this.prefixes.push(funnelConfig.prefix);

    funnelConfig.routes.forEach((route, i) => {
      if (!route.method) {
        throw new FunnelConfigError(
          `Route at index ${i} is missing route method`
        );
      }
      if (!route.path) {
        throw new FunnelConfigError(
          `Route at index ${i} is missing route path`
        );
      }
    });

    return funnelConfig;
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(session(this.sessionOptions));
    if (process.env.NODE_ENV === "development") {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        res.set("Cache-Control", "no-store");
        next();
      });
    }
    this.app.use(express.urlencoded({ extended: true }));
    this.app.set("view engine", this.viewEngine);
    this.app.set("views", process.cwd());
  }

  private loadStaticFiles(funnelDir: string, prefix: string) {
    this.app.use(
      `/${prefix}`,
      express.static(path.resolve(this.mainFunnelsDir, funnelDir, "public"))
    );
  }

  private loadHandlersModule(funnelDir: string): HandlersModule {
    const handlersModulePath = require.resolve(
      path.resolve(this.mainFunnelsDir, funnelDir, "handlers")
    );

    delete require.cache[handlersModulePath];

    const handlersModule: HandlersModule = require(handlersModulePath);

    return handlersModule;
  }

  private defineRoutes(
    funnelConfig: FunnelConfig,
    funnelDir: string,
    handlersModule: HandlersModule
  ) {
    funnelConfig.routes.forEach((route: Route) => {
      const routeHandler = async (req: Request, res: Response) => {
        if (route.template) {
          const templatePath = path.resolve(
            this.mainFunnelsDir,
            funnelDir,
            "views",
            route.template
          );

          const postRenderHandler = handlersModule.postRenderHandler;
          const renderCallback = (err: any, html: string) => {
            if (isAsyncFunction(postRenderHandler)) {
              res.send(html);
              postRenderHandler(req, res, "hi", 1).then(() => {});
            } else {
              res.send(html);

              postRenderHandler();
            }
          };

          res.render(templatePath, route.data, renderCallback);
        }
      };

      const handlers: RequestHandler[] = [];

      if (route.handlers) {
        route.handlers.forEach((handlerName) => {
          const handler = handlersModule.actionHandlers[handlerName];
          if (handler instanceof Function) {
            handlers.push(handler);
          }
        });
      }

      handlers.push(routeHandler);

      let prefixedPath = funnelConfig.prefix
        ? `/${funnelConfig.prefix}${route.path}`
        : route.path;

      if (route.method === "get") {
        this.app.get(prefixedPath, handlers);
      } else if (route.method === "post") {
        this.app.post(prefixedPath, handlers);
      } else if (route.method === "put") {
        this.app.post(prefixedPath, handlers);
      } else if (route.method === "delete") {
        this.app.post(prefixedPath, handlers);
      }
    });
  }

  public start(port: number, callback?: () => void) {
    if (!fs.existsSync(this.mainFunnelsDir)) {
      throw new Error("Please make sure 'funnels' directoy exists in root");
    }

    this.app.listen(port, () => {
      if (callback) {
        callback();
      }
    });
  }

  public createFunnel(funnelDir: string) {
    const funnelConfig = this.getFunnelConfig(funnelDir);

    this.loadStaticFiles(funnelDir, funnelConfig.prefix);

    const handlersModule = this.loadHandlersModule(funnelDir);

    this.defineRoutes(
      funnelConfig,
      funnelDir,
      handlersModule as HandlersModule
    );
  }
}
