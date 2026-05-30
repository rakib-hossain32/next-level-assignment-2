import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../config/env";
import sendResponse from "../utils/sendResponse";

const issueDelete = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Unauthorized access!!",
        });
      }

      const decoded = jwt.verify(token as string, config.secret) as JwtPayload;

      if (decoded.role !== "maintainer") {
        return sendResponse(res, {
          statusCode: StatusCodes.CONFLICT,
          success: false,
          message: "Only maintainer issues can be updated",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default issueDelete;
