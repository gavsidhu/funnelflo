export interface Route {
  path: string;
  method: string;
  template: string;
  data: {
    pageTitle: string;
  };
  handlers: string[];
  postRenderHandler: string;
}

export interface FunnelConfig {
  funnelName: string;
  prefix: string;
  routes: Route[];
}
