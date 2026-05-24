import { Router, type IRouter } from "express";
import { issueController } from "./issue.controller";

const route: IRouter = Router();

route.post("/issues", issueController.createIssue);
