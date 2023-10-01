import express, { Request, Response, NextFunction } from "express";

export interface HandlersModule {
  actionHandlers: ActionHandlers;
  postRenderHandler: PostRenderHandler;
}

export interface ActionHandlers {
  [key: string]: (req?: Response, res?: Response, next?: NextFunction) => {};
}

export type PostRenderHandler = (
  req?: Request,
  res?: Response,
  ...args: any
) => any | (() => Promise<void>);
