import { Router, type IRouter } from "express";
import { issueController } from "./issue.controller";
import issueCreate from "../../middleware/issueCreate";
import { USER_ROLES } from "../../types";

const route: IRouter = Router();

route.post(
  "/issues",
  issueCreate(USER_ROLES.contributor, USER_ROLES.maintainer),
  issueController.createIssue,
);

route.get("/issues", issueController.getAllIssues);
route.get("/issues/:id", issueController.getByIdIssue);
route.patch("/issues/:id",);

export const issueRoute = route;
