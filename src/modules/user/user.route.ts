import { Router } from "express";
import { createUser } from "./user.controller";

const route: Router = Router();

// route.get("/");

route.post("/signup", createUser);





export const userRoute = route;
