import type { Request, Response } from "express";
import { userService } from "./user.service";
import { StatusCodes } from "http-status-codes";

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const result = await createUserDB(req.body);

//     const { id, name, email, role, created_at, updated_at } = result.rows[0];

//     console.log(result);
//     res.status(StatusCodes.CREATED).json({
//       success: true,
//       message: "User registered successfully",
//       data: { id, name, email, role, created_at, updated_at },
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const result = await userService.create(req.body);

      const { id, name, email, role, created_at, updated_at } = result.rows[0];

    //   console.log(result);
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "User registered successfully",
        data: { id, name, email, role, created_at, updated_at },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
        const result = await userService.login(req.body);
      
        // console.log("result for login", result);

          // console.log("auth controller", result);
          const { accessToken } = result;

          res.cookie("accessToken", accessToken, {
            secure: false, // in production => true
            httpOnly: true,
            sameSite: "lax",
          });

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Login successful",
            data: {
                token: result.accessToken,
                user: result.user
            }
        })
        
    } catch (error) {
      console.log("login user", error);
    }
  }
}

export const userController = new UserController();
