import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./Utils/cors/cors";
import rateLimit from "express-rate-limit";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import {
  authController,
  userController,
  postController,
  notificationController,
  chatController,
} from "./Modules";
import connectDB from "./DB/connection";
import { intializeFirebase } from "./Utils/firebase/firebase.config";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./Modules/graphql/graphql.schema";
import { buildContext } from "./Modules/graphql/graphql.context";
import { intializeSocket } from "./Utils/socket/socket.service";
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
  app.use(
    cors({
      origin: "*",
    }),
    limiter,
    helmet(),
  );
  intializeFirebase();
  app.all(
    "/graphql",
    createHandler({
      schema,
      context: async (req) => {
        const raw = req.raw as Request;
        const context = await buildContext(raw.headers.authorization);
        return context as unknown as Record<PropertyKey, unknown>;
      },
    }),
  );

  app.get("/", (req: Request, res: Response) => {
    return res.json({ message: "Appliction Success" }).status(200);
  });
  app.use("/api/v1/auth", authController);
  app.use("/api/v1/user", userController);
  app.use("/api/v1/post", postController);
  app.use("/api/v1/notification", notificationController);
  app.use("/api/v1/chat", chatController);

  app.use((req: Request, res: Response) => {
    throw new NotFoundException("Route Not Found");
  });
  app.use(globalErrorHandler);

  const httpServer = app.listen(3000, () => {
    console.log(`Server is running on http://127.0.0.1:3000`);
  });
  intializeSocket(httpServer);
};
