

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import { StatusCodes as StatusCodes7 } from "http-status-codes";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/modules/user/user.service.ts
import bcrypt from "bcrypt";

// src/db/database.ts
import { Pool } from "pg";

// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
import process from "process";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  refresh_secret: process.env.REFRESH_SECRET,
  secret: process.env.SECRET
};
var env_default = config;

// src/db/database.ts
var pool = new Pool({
  connectionString: env_default.database_url
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(40)   NOT NULL,
            email VARCHAR(40) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(15) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT CHECK (LENGTH(description)>=20),
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
import jwt from "jsonwebtoken";
var UserService = class {
  async create(payload) {
    const { name, password, email, role } = payload;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
  
    INSERT INTO users(name, email,  password , role)
    VALUES($1,$2,$3, $4) RETURNING *
    `,
      [name, email, hashPassword, role]
    );
    return result;
  }
  async login(payload) {
    const { email, password } = payload;
    const result = await pool.query(
      `
        SELECT * FROM users WHERE email=$1
      `,
      [email]
    );
    if (result.rows.length === 0) {
      throw new Error("Invalid Credentials!");
    }
    const user = result.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      throw new Error("Invalid Credentials!");
    }
    const jwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      email: user.email
    };
    const accessToken = jwt.sign(jwtPayload, env_default.secret, {
      expiresIn: "1d"
    });
    delete user.password;
    return { accessToken, user };
  }
};
var userService = new UserService();

// src/modules/user/user.controller.ts
import { StatusCodes } from "http-status-codes";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var UserController = class {
  async createUser(req, res, next) {
    try {
      const result = await userService.create(req.body);
      const { id, name, email, role, created_at, updated_at } = result.rows[0];
      sendResponse_default(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data: { id, name, email, role, created_at, updated_at }
      });
    } catch (error) {
      next(error);
    }
  }
  async loginUser(req, res, next) {
    try {
      const result = await userService.login(req.body);
      const { accessToken } = result;
      res.cookie("accessToken", accessToken, {
        secure: false,
        httpOnly: true,
        sameSite: "lax"
      });
      sendResponse_default(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Login successful",
        data: {
          token: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
var userController = new UserController();

// src/modules/user/user.route.ts
var route = Router();
route.post("/signup", userController.createUser);
route.post("/login", userController.loginUser);
var userRoute = route;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
import jwt2 from "jsonwebtoken";
var IssueService = class {
  async create(payload, token) {
    const { title, description, type, status } = payload;
    const result = await pool.query(
      `
         INSERT INTO issues(title, description,  type, status)
    VALUES($1,$2,$3,$4) RETURNING *
        `,
      [title, description, type, status || "open"]
    );
    const decoded = jwt2.verify(token, env_default.secret);
    const userData = await pool.query(
      `
        SELECT * FROM users   WHERE email=$1
        `,
      [decoded.email]
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
      [user.id, currentIssue.id]
    );
    if (updatedReporterId.rows.length === 0) {
      throw new Error("Reporter Id not updated!");
    }
    const issue = {
      ...currentIssue,
      reporter_id: user.id
    };
    return issue;
  }
  async getAll(payload) {
    const { sort = "newest", type, status } = payload;
    let query = `SELECT * FROM issues`;
    const conditions = [];
    const values = [];
    if (type) {
      conditions.push(`type = $${values.length + 1}`);
      values.push(type);
    }
    if (status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status);
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
      throw new Error("reporter id not found!");
    }
    const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(",");
    const userQuery = `
      SELECT id, name, role
      FROM users
      WHERE id IN (${placeholders})
    `;
    const usersResult = await pool.query(userQuery, reporterIds);
    const users = usersResult.rows;
    const reporterMap = {};
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
      updated_at: issue.updated_at
    }));
    return formattedIssues;
  }
  async getById(id) {
    const issueResult = await pool.query(
      `
    SELECT * FROM issues 
    WHERE id=$1 `,
      [id]
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
      [issue.reporter_id]
    );
    const reporter = reporterResult.rows[0];
    const formattedIssue = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
    return formattedIssue;
  }
  async update(payload, id) {
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
      [title, description, type, id]
    );
    const updated = updateResult.rows[0];
    return updated;
  }
  async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM issues WHERE id=$1
      `,
      [id]
    );
    return result;
  }
};
var issueService = new IssueService();

// src/modules/issue/issue.controller.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";
var IssueController = class {
  async createIssue(req, res, next) {
    try {
      const token = req.headers.authorization;
      const result = await issueService.create(req.body, token);
      sendResponse_default(res, {
        statusCode: StatusCodes2.CREATED,
        success: true,
        message: "Issue created successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllIssues(req, res, next) {
    try {
      const result = await issueService.getAll(req.query);
      sendResponse_default(res, {
        statusCode: StatusCodes2.OK,
        success: true,
        message: "Issues retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  async getByIdIssue(req, res, next) {
    const { id } = req.params;
    try {
      const result = await issueService.getById(id);
      sendResponse_default(res, {
        statusCode: StatusCodes2.OK,
        success: true,
        message: "Issues retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  async updateIssue(req, res, next) {
    const { id } = req.params;
    try {
      const result = await issueService.update(req.body, id);
      sendResponse_default(res, {
        statusCode: StatusCodes2.OK,
        success: true,
        message: "Issue updated successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteIssue(req, res, next) {
    const { id } = req.params;
    try {
      const result = await issueService.delete(id);
      if (result.rowCount === 0) {
        sendResponse_default(res, {
          statusCode: StatusCodes2.NOT_FOUND,
          success: true,
          message: "Issue not Found"
        });
      }
      sendResponse_default(res, {
        statusCode: StatusCodes2.OK,
        success: true,
        message: "Issue deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var issueController = new IssueController();

// src/middleware/issueCreate.ts
import jwt3 from "jsonwebtoken";
import { StatusCodes as StatusCodes3 } from "http-status-codes";
var issueCreate = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statusCode: StatusCodes3.UNAUTHORIZED,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt3.verify(token, env_default.secret);
      const userData = await pool.query(
        `
        SELECT * FROM users   WHERE email=$1
        `,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: StatusCodes3.NOT_FOUND,
          success: false,
          message: "user not found!!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        sendResponse_default(res, {
          statusCode: StatusCodes3.FORBIDDEN,
          success: false,
          message: "Forbidden !"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var issueCreate_default = issueCreate;

// src/types/index.ts
var USER_ROLES = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/issueUpdate.ts
import jwt4 from "jsonwebtoken";
import { StatusCodes as StatusCodes4 } from "http-status-codes";
var issueUpdate = () => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statusCode: StatusCodes4.UNAUTHORIZED,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt4.verify(token, env_default.secret);
      const issueResult = await pool.query(
        `SELECT *
      FROM issues
      WHERE id = $1`,
        [id]
      );
      if (issueResult.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: StatusCodes4.NOT_FOUND,
          success: false,
          message: "Issue not found"
        });
      }
      const issue = issueResult.rows[0];
      if (decoded.role !== "maintainer") {
        if (issue.reporter_id !== decoded.id) {
          return sendResponse_default(res, {
            statusCode: StatusCodes4.FORBIDDEN,
            success: false,
            message: "You are not allowed to update this issue"
          });
        }
        if (issue.status !== "open") {
          return sendResponse_default(res, {
            statusCode: StatusCodes4.CONFLICT,
            success: false,
            message: "Only open issues can be updated"
          });
        }
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};
var issueUpdate_default = issueUpdate;

// src/middleware/issueDelete.ts
import jwt5 from "jsonwebtoken";
import { StatusCodes as StatusCodes5 } from "http-status-codes";
var issueDelete = () => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: StatusCodes5.UNAUTHORIZED,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt5.verify(token, env_default.secret);
      if (decoded.role !== "maintainer") {
        return sendResponse_default(res, {
          statusCode: StatusCodes5.CONFLICT,
          success: false,
          message: "Only maintainer issues can be updated"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var issueDelete_default = issueDelete;

// src/modules/issue/issue.route.ts
var route2 = Router2();
route2.post(
  "/issues",
  issueCreate_default(USER_ROLES.contributor, USER_ROLES.maintainer),
  issueController.createIssue
);
route2.get("/issues", issueController.getAllIssues);
route2.get("/issues/:id", issueController.getByIdIssue);
route2.patch("/issues/:id", issueUpdate_default(), issueController.updateIssue);
route2.delete("/issues/:id", issueDelete_default(), issueController.deleteIssue);
var issueRoute = route2;

// src/middleware/globalErrorHandler.ts
import { StatusCodes as StatusCodes6 } from "http-status-codes";
var AppError = class extends Error {
  statusCode;
  status;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var notFoundHandler = (req, res, next) => {
  next(new AppError(`\u{1F50D} Not Found - ${req.originalUrl}`, 404));
};
var globalErrorHandler = (err, req, res, next) => {
  res.status(StatusCodes6.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
    errors: err
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(StatusCodes7.OK).json({
    success: true,
    message: "Assignment Server is running..."
  });
});
app.use("/api/auth", userRoute);
app.use("/api", issueRoute);
app.use(notFoundHandler);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(env_default.port, () => {
    console.log(`assignment server is running port - ${env_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map