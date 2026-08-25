import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./Utils/cors/cors";
import rateLimit from "express-rate-limit";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { authController, userController, postController } from "./Modules";
import connectDB from "./DB/connection";
const limiter = rateLimit({
  windowMs: 15 * 40 * 1000,
  limit: 50,
  message: "Too Many requests,please try again later",
  legacyHeaders: false,
  standardHeaders: "draft-8",
});
export const bootstrap = async (): Promise<void> => {
  const app: Express = express();
  await connectDB();
  app.use(express.json());
  app.use(cors(corsOptions), limiter, helmet());

  app.get("/", (req: Request, res: Response) => {
    return res.json({ message: "Appliction Success" }).status(200);
  });
  app.use("/api/v1/auth", authController);
  app.use("/api/v1/user", userController);
  app.use("/api/v1/post", postController);

  app.use((req: Request, res: Response) => {
    throw new NotFoundException("Route Not Found");
  });
  app.use(globalErrorHandler);

  app.listen(3000, () => {
    console.log(`Server is running on http://127.0.0.1:3000`);
  });
};
