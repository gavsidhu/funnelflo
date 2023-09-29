import express, { Request, Response, NextFunction } from "express";

export interface HandlersModule {
  actionHandlers: ActionHandlers;
  postRenderHandler: PostRenderHandler;
}

export interface ActionHandlers {
  [key: string]: express.RequestHandler;
}

export type PostRenderHandler = (
  req?: Request,
  res?: Response,
  ...args: any
) => any | (() => Promise<void>);
