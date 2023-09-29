export class FunnelConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FunnelConfigError";
  }
}

export class PrefixError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrefixError";
  }
}
