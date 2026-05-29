import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../config/env";

const issueDelete = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;

      if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }

      const decoded = jwt.verify(token as string, config.secret) as JwtPayload;

      if (decoded.role !== "maintainer") {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: "Only maintainer issues can be updated",
        });
      }

      //   console.log("delete issue", decoded);
      next();
    } catch (error) {
      next(error);
    //   console.log("delete issue error", error);
    }
  };
};

export default issueDelete;
