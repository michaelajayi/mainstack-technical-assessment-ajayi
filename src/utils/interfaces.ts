import { Request } from "express";

export interface TokenPayload {
  user: {
    id: number | string;
  };
}

export interface CustomRequest extends Request {
  user?: TokenPayload["user"];
}
