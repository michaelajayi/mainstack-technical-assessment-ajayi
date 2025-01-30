import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../errors";
import logger from "../utils/logger";

const validateResource =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        next(new ValidationError(JSON.stringify(errors)));
      }
      logger.error(err);
    }
  };

export default validateResource;
