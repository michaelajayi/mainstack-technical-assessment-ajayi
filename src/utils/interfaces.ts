import { Request } from "express";

export interface TokenPayload {
  user: {
    id: number;
  };
}

export interface CustomRequest extends Request {
  user?: TokenPayload["user"];
}
