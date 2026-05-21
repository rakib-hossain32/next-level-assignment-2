import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { StatusCodes } from "http-status-codes";

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

export default app;
