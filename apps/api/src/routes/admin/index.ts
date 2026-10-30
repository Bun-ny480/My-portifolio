import { Router } from "express";
import { adminProjectsRouter } from "./projects.js";

export const adminRouter = Router();

adminRouter.use("/projects", adminProjectsRouter);
/* the following will be added in later steps:
   adminRouter.use("/blog",     adminBlogRouter);
   adminRouter.use("/services", adminServicesRouter);
   adminRouter.use("/skills",   adminSkillsRouter);
   adminRouter.use("/messages", adminMessagesRouter);
   adminRouter.use("/profile",  adminProfileRouter);
   adminRouter.use("/resume",   adminResumeRouter);
   adminRouter.use("/uploads",  adminUploadsRouter);
*/
