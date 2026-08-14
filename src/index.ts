import { bootstrap } from "./app.controller";

bootstrap().catch((error: unknown) => {
  console.log(`Faild to start application`, error);
  process.exit(1);
});
