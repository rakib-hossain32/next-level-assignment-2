import { Router } from "express";
import { userController } from "./user.controller";
// import { createUser } from "./user.controller";

const route: Router = Router();

// route.get("/");

route.post("/signup", userController.createUser);
route.post("/login", userController.loginUser);

export const userRoute = route;
