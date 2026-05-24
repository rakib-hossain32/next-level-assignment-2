import type { Request, Response } from "express";
import type { IUserCreate, IUserLogin } from "./user.interface";
import bcrypt from "bcrypt";
import { pool } from "../../db/database";
import jwt from "jsonwebtoken";
import config from "../../config/env";

// export const createUserDB = async (payload: IUserCreate) => {
//   const { name, password, email, role } = payload;

//   const hashPassword = await bcrypt.hash(password, 10);

//   const result = await pool.query(
//     `

//     INSERT INTO users(name, email,  password , role)
//     VALUES($1,$2,$3, $4) RETURNING *
//     `,
//     [name, email, hashPassword, role],
//   );

//   // delete result.rows[0].password;
//   // console.log("service",result)

//   return result;
// };

class UserService {
  async create(payload: IUserCreate) {
    const { name, password, email, role } = payload;

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
  
    INSERT INTO users(name, email,  password , role)
    VALUES($1,$2,$3, $4) RETURNING *
    `,
      [name, email, hashPassword, role],
    );

    // delete result.rows[0].password;
    // console.log("service",result)

    return result;
  }

  async login(payload: IUserLogin) {
    const { email, password } = payload;
    const result = await pool.query(
      `
        SELECT * FROM users WHERE email=$1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid Credentials!");
    }

    const user = result.rows[0];

    const matchPassword = await bcrypt.compare(password, user.password);

    // console.log(matchPassword);

    if (!matchPassword) {
      throw new Error("Invalid Credentials!");
    }

    // generate token
    const jwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      email: user.email,
    };

    const accessToken = jwt.sign(jwtPayload, config.secret, {
      expiresIn: "1d",
    });

    // const refreshToken = jwt.sign(jwtPayload, config.refresh_secret, {
    //   expiresIn: "1d",
    // });
    // user.delete(password)
    delete user.password;

    return { accessToken, user };
  }
}

export const userService = new UserService();
