import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../config/env";
import { pool } from "../db/database";
import sendResponse from "../utils/sendResponse";

const issueUpdate = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;

      if (!token) {
        sendResponse(res, {
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Unauthorized access!!",
        });
        
      }

      const decoded = jwt.verify(token as string, config.secret) as JwtPayload;

      const issueResult = await pool.query(
        `SELECT *
      FROM issues
      WHERE id = $1`,
        [id],
      );

      if (issueResult.rows.length === 0) {
        return sendResponse(res, {
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: "Issue not found",
        });
      }

      const issue = issueResult.rows[0];

      if (decoded.role !== "maintainer") {
        if (issue.reporter_id !== decoded.id) {
          return sendResponse(res, {
            statusCode: StatusCodes.FORBIDDEN,
            success: false,
            message: "You are not allowed to update this issue",
          });
        }

        if (issue.status !== "open") {
          return sendResponse(res, {
            statusCode: StatusCodes.CONFLICT,
            success: false,
            message: "Only open issues can be updated",
          });
        }
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};

export default issueUpdate;
