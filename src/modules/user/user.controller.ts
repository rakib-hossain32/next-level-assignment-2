import type { Request, Response } from "express";
import { createUserDB } from "./user.service";
import { StatusCodes } from "http-status-codes";


export const createUser = async (req: Request, res: Response) => {

try {
    const result = await createUserDB(req.body)

    const {id, name, email, role, created_at, updated_at} = result.rows[0]

    console.log(result)
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "User registered successfully",
        data: {id,name, email, role, created_at, updated_at}
    })

} catch (error) {
    console.log(error)
    
}

};