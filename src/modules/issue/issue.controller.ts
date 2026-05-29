import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../db/database";
import sendResponse from "../../utils/sendResponse";

class IssueController {
  async createIssue(req: Request, res: Response) {
    try {
      // console.log(req.headers.authorization, "issue controller");
      const token = req.headers.authorization as string;

      const result = await issueService.create(req.body, token);

      //   console.log("controller issue", result);
      //   res.json({ result });
      // res.status(StatusCodes.CREATED).json({
      //   success: true,
      //   message: "Issue created successfully",
      //   data: result,
      // });


      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Issue created successfully",
        data: result,
      });

    } catch (error) {
      console.log("issue controller", error);
    }
  }

  async getAllIssues(req: Request, res: Response) {
    try {
      const result = await issueService.getAll(req.query);
      // console.log("get All issues", result);

      // const issues = result
      // console.log("issues controller",result)
      // // console.log(result.rows)

      // res.status(StatusCodes.OK).json({
      //   success: true,
      //   message: "Issues retrived successfully",
      //   data: result,
      // });

      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Issue created successfully",
        data: result,
      });



    } catch (error) {}
  }

  async getByIdIssue(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await issueService.getById(id as string);
      res.status(200).json({
        success: true,
        message: "Issue retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Something went wrong",
        errors: error,
      });
    }
  }

  async updateIssue(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const result = await issueService.update(req.body, id as string);

      console.log("update issue", result);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Issue updated successfully",
        data: result,
      });
    } catch (error) {}
  }

  async deleteIssue(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await issueService.delete(id as string);

      console.log("delete issue", result);
      if (result.rowCount === 0) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "User not Found",
        });
      }

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Issue deleted successfully",
      });
    } catch (error) {
      console.log("delete issue", error);
    }
  }
}
export const issueController = new IssueController();
