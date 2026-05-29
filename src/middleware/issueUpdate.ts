import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../config/env";
import { pool } from "../db/database";

const issueUpdate = () => {
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

      const issueResult = await pool.query(
        `SELECT *
      FROM issues
      WHERE id = $1`,
        [id],
      );

      // issue না থাকলে
      if (issueResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Issue not found",
        });
      }

      const issue = issueResult.rows[0];

      // maintainer হলে সব allowed
      if (decoded.role !== "maintainer") {
        // contributor হলে নিজের issue হতে হবে
        if (issue.reporter_id !== decoded.id) {
          return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "You are not allowed to update this issue",
          });
        }

        // issue অবশ্যই open হতে হবে
        if (issue.status !== "open") {
          return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: "Only open issues can be updated",
          });
        }
        next();
      }

      // console.log("update middleware");
    } catch (error) {
      next(error)
        // console.log("update middleware", error)
    }
  };
};

export default issueUpdate;
