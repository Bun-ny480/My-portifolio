import { Router } from "express";
import { adminProjectsRouter } from "./projects.js";
import { adminBlogRouter } from "./blog.js";
import { adminMessagesRouter } from "./messages.js";
import { adminProfileRouter } from "./profile.js";
import { adminServicesRouter } from "./services.js";
import { adminSkillsRouter } from "./skills.js";
import { adminResumeRouter } from "./resume.js";
import { adminUploadsRouter } from "./uploads.js";
import { adminMediaRouter } from "./media.js";

export const adminRouter = Router();

adminRouter.use("/projects", adminProjectsRouter);
adminRouter.use("/blog", adminBlogRouter);
adminRouter.use("/messages", adminMessagesRouter);
adminRouter.use("/profile", adminProfileRouter);
adminRouter.use("/services", adminServicesRouter);
adminRouter.use("/skills", adminSkillsRouter);
adminRouter.use("/resume", adminResumeRouter);
adminRouter.use("/uploads", adminUploadsRouter);
adminRouter.use("/media", adminMediaRouter);
