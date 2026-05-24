import { pool } from "../../db/database";

class IssueService {
  async create() {
    const result = await pool.query(``);
  }
}

export const issueService = new IssueService();
