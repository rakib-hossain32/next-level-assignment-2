import type { NextFunction, Request, Response } from "express";
import { issueService } from "./issue.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";

class IssueController {
  async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
    
      const token = req.headers.authorization as string;

      const result = await issueService.create(req.body, token);

    

      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Issue created successfully",
        data: result,
      });
    } catch (error) {
      
      next(error)
    }
  }

  async getAllIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.getAll(req.query);
     


      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Issues retrieved successfully",
        data: result,
      });
    } catch (error) {
    
      next(error);
    }
  }

  async getByIdIssue(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const result = await issueService.getById(id as string);
     

      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Issues retrieved successfully",
        data: result,
      });
    } catch (error) {
     
      next(error);
     
    }
  }

  async updateIssue(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await issueService.update(req.body, id as string);

      

      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Issue updated successfully",
        data: result,
      });
    } catch (error) {
     
      next(error);
    }
  }

  async deleteIssue(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const result = await issueService.delete(id as string);

     
      if (result.rowCount === 0) {
        sendResponse(res, {
          statusCode: StatusCodes.NOT_FOUND,
          success: true,
          message: "Issue not Found",
        });
       
      }

      
      sendResponse(res, {
        statusCode: StatusCodes.OK,
          success: true,
          message: "Issue deleted successfully",
      })
    } catch (error) {
      next(error);
    }
  }
}
export const issueController = new IssueController();
