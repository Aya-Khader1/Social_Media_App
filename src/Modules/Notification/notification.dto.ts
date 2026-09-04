import { z } from "zod";
import {
  deviceTokenSchema,
  listNotificationSchema,
  notificationParamSchema,
} from "./notification.validation";

export type IDeviceTokenDTO = z.infer<typeof deviceTokenSchema.body>;
export type IListNotificationDTO = z.infer<typeof listNotificationSchema.query>;
export type INotificationParamsDTO = z.infer<
  typeof notificationParamSchema.params
>;
