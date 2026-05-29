import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { UserRoles } from "../types";
import { StatusCodes } from "http-status-codes";
import config from "../config/env";
import { pool } from "../db/database";

const issueCreate = (...roles: UserRoles[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log("issue controller", req.headers.authorization);

    try {
      const token = req.headers.authorization;

      if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }

      const decoded = jwt.verify(token as string, config.secret) as JwtPayload;

      const userData = await pool.query(
        `
        SELECT * FROM users   WHERE email=$1
        `,
        [decoded.email],
      );

      //    console.log(userData);
      const user = userData.rows[0];

      if (userData.rows.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "user not found!!",
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden !",
        });
      }
      //   console.log(decoded, "dafdsaf")

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
      // console.log("middleware", error);
    }
  };
};

export default issueCreate;
