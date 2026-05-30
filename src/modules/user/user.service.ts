
import type { IUserCreate, IUserLogin } from "./user.interface";
import bcrypt from "bcrypt";
import { pool } from "../../db/database";
import jwt from "jsonwebtoken";
import config from "../../config/env";


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

   
    delete user.password;

    return { accessToken, user };
  }
}

export const userService = new UserService();
