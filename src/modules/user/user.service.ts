import type { Request, Response } from "express";
import type { IUserCreate } from "./user.interface";
import bcrypt from "bcrypt";
import { pool } from "../../db/database";

export const createUserDB = async (payload: IUserCreate) => {
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
};
