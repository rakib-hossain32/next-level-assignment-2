import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool } from "../../db/database";
import type { IIssueCreate } from "./issue.interface";
import config from "../../config/env";

class IssueService {
  async create(payload: IIssueCreate, token: string) {
    const { title, description, type, status } = payload;
    const result = await pool.query(
      `
         INSERT INTO issues(title, description,  type, status)
    VALUES($1,$2,$3,$4) RETURNING *
        `,
      [title, description, type, status || "open"],
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
  }

  async getAll(req: any) {
    const { sort = "newest", type, status } = req;

    // =========================

    let query = `SELECT * FROM issues`;

    const conditions: string[] = [];
    const values: string[] = [];

    if (type) {
      conditions.push(`type = $${values.length + 1}`);
      values.push(type as string);
    }

    if (status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status as string);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (sort === "oldest") {
      query += ` ORDER BY created_at ASC`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    const issuesResult = await pool.query(query, values);

    const issues = issuesResult.rows;

    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

    if (reporterIds.length === 0) {
      return;
    }

    const placeholders = reporterIds
      .map((_, index) => `$${index + 1}`)
      .join(",");

    const userQuery = `
      SELECT id, name, role
      FROM users
      WHERE id IN (${placeholders})
    `;

    const usersResult = await pool.query(userQuery, reporterIds);

    const users = usersResult.rows;

    const reporterMap: Record<number, any> = {};

    users.forEach((user) => {
      reporterMap[user.id] = user;
    });

    const formattedIssues = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter: reporterMap[issue.reporter_id],

      created_at: issue.created_at,
      updated_at: issue.updated_at,
    }));

    return formattedIssues;
  }

  async getById(id: string) {
    const issueResult = await pool.query(
      `
    SELECT * FROM issues 
    WHERE id=$1 `,
      [id],
    );

    
    if (issueResult.rows.length === 0) {
     
      throw new Error("Issue not found");
    }

    const issue = issueResult.rows[0];

    const reporterResult = await pool.query(
      `
        SELECT id, name, role
         FROM users
         WHERE id = $1
      `,
      [issue.reporter_id],
    );

    const reporter = reporterResult.rows[0];

    const formattedIssue = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter: reporter,

      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };

    return formattedIssue;
  }

  async update(payload: Partial<IIssueCreate>, id: string) {
    const { title, description, type } = payload;

    const updateResult = await pool.query(
      `
       UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
      `,
      [title, description, type, id],
    );
    const updated = updateResult.rows[0];

    return updated;
  }

  async delete(id: string) {
    const result = await pool.query(
      `
      DELETE FROM issues WHERE id=$1
      `,
      [id],
    );

    return result;
  }
}

export const issueService = new IssueService();
