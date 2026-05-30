import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";


class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.create(req.body);

      const { id, name, email, role, created_at, updated_at } = result.rows[0];

 
      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data: { id, name, email, role, created_at, updated_at },
      });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.login(req.body);

     
      const { accessToken } = result;

      res.cookie("accessToken", accessToken, {
        secure: false, 
        httpOnly: true,
        sameSite: "lax",
      });

      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Login successful",
        data: {
          token: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error)
      
    }
  }
}

export const userController = new UserController();
