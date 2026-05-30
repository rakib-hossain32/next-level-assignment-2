import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { StatusCodes } from "http-status-codes";
import { userRoute } from "./modules/user/user.route";
import { issueRoute } from "./modules/issue/issue.route";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Assignment Server is running...",
  });
});

app.use("/api/auth", userRoute);

app.use("/api", issueRoute);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
