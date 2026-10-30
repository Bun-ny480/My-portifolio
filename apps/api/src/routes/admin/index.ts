import { Router } from "express";
import { adminProjectsRouter } from "./projects.js";
import { adminBlogRouter } from "./blog.js";
import { adminMessagesRouter } from "./messages.js";

export const adminRouter = Router();

adminRouter.use("/projects", adminProjectsRouter);
adminRouter.use("/blog", adminBlogRouter);
adminRouter.use("/messages", adminMessagesRouter);
/* the following will be added in later steps:
   adminRouter.use("/services", adminServicesRouter);
   adminRouter.use("/skills",   adminSkillsRouter);
   adminRouter.use("/profile",  adminProfileRouter);
   adminRouter.use("/resume",   adminResumeRouter);
   adminRouter.use("/uploads",  adminUploadsRouter);
*/

