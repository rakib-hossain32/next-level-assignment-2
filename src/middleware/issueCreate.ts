import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { UserRoles } from "../types";
import { StatusCodes } from "http-status-codes";
import config from "../config/env";
import { pool } from "../db/database";
import sendResponse from "../utils/sendResponse";

const issueCreate = (...roles: UserRoles[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {


    try {
      const token = req.headers.authorization;

      if (!token) {
        sendResponse(res, {
          statusCode: StatusCodes.UNAUTHORIZED,
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


        sendResponse(res, {
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: "user not found!!",
        });

      }

      if (roles.length && !roles.includes(user.role)) {

        sendResponse(res, {
          statusCode: StatusCodes.FORBIDDEN,
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
