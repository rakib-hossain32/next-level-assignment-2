import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../db/database";

class IssueController {
  async createIssue(req: Request, res: Response) {
    try {
      console.log(req.headers.authorization, "issue controller");
      const token = req.headers.authorization as string;

      const result = await issueService.create(req.body, token);

      //   console.log("controller issue", result);
      //   res.json({ result });
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Issue created successfully",
        data: result,
      });
    } catch (error) {
      console.log("issue controller", error);
    }
  }

  async getAllIssues(req: Request, res: Response) {
    const result = await issueService.getAll();
    // console.log("get All issues", result);

    const issues = result.rows
    // console.log(result.rows)

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Issues retrived successfully",
      data: issues,
    });
  }
}
export const issueController = new IssueController();
