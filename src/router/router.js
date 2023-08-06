import authController from "../controllers/auth.controller.js";
import adminController from "../controllers/admin.controller.js";

const router = (app) => {
  app.use("/auth", authController);
  app.use("/admin", adminController);
};

export default router;