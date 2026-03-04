import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodError } from 'zod';

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

const formatZodErrors = (error: ZodError) =>
  error.errors.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

export const validateResource =
  (schemas: ValidationSchemas) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({
          message: 'Validation failed',
          errors: formatZodErrors(error as ZodError),
        });
        return;
      }

      next(error);
    }
  };
