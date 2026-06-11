import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // safeParse or parse to validate req.body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const isZodError = error instanceof ZodError || 
        (error && typeof error === "object" && ((error as any).name === "ZodError" || (error as any).constructor?.name === "ZodError"));

      if (isZodError) {
        const errors = (error as any).errors.map((err: any) => ({
          field: `body.${err.path.join(".")}`,
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
export default validateRequest;
