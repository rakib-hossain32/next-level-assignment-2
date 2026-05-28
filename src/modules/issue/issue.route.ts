import { Router, type IRouter } from "express";
import { issueController } from "./issue.controller";
import issueCreate from "../../middleware/issueCreate";
import { USER_ROLES } from "../../types";
import issueUpdate from "../../middleware/issueUpdate";

const route: IRouter = Router();

route.post(
  "/issues",
  issueCreate(USER_ROLES.contributor, USER_ROLES.maintainer),
  issueController.createIssue,
);

route.get("/issues", issueController.getAllIssues);
route.get("/issues/:id", issueController.getByIdIssue);
route.patch("/issues/:id", issueUpdate(), issueController.updateIssue);
route.delete("/issues/:id", issueController.deleteIssue);

export const issueRoute = route;
