import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool } from "../../db/database";
import type { IIssueCreate } from "./issue.interface";
import config from "../../config/env";

class IssueService {
  async create(payload: IIssueCreate, token: string): Promise<void> {
    try {
      const { title, description, type } = payload;
      const result = await pool.query(
        `
         INSERT INTO issues(title, description,  type)
    VALUES($1,$2,$3) RETURNING *
        `,
        [title, description, type],
      );

      const decoded = jwt.verify(token, config.secret) as JwtPayload;

      //   console.log("decoded user", decoded)

      const userData = await pool.query(
        `
        SELECT * FROM users   WHERE email=$1
        `,
        [decoded.email],
      );

      if (userData.rows.length === 0) {
        throw new Error("user not found!!");
      }

      if (result.rows[0].length === 0) {
        throw new Error("issue not found!!");
      }

      const user = userData.rows[0];
      const currentIssue = result.rows[0];

      const updatedReporterId = await pool.query(
        `UPDATE issues SET
    reporter_id = COALESCE($1, reporter_id)
   WHERE id = $2
   RETURNING *`,
        [user.id, currentIssue.id],
      );

      if (updatedReporterId.rows.length === 0) {
        throw new Error("Reporter Id not updated!");
      }

      //   console.log("updatedReport",updatedReporterId)

      const issue = {
        ...currentIssue,
        reporter_id: user.id,
      };

      // console.log("user data",userData.rows[0]);

      // console.log("result issue", issue);
      return issue;
    } catch (error) {
      console.log('issue error', error)
    }
  }

  async getAll() { 
 const result = await pool.query(`
SELECT * FROM issues
      `);
 return result; 
  }

}

export const issueService = new IssueService();
