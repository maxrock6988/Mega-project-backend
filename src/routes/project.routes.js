import { Router } from "express";
import {
  getproject,
  getprojectById,
  CreateProject,
  UpdateProject,
  DeleteProject,
  AddMemberToproject,
  GetMemberToproject,
  UpdateMemberRole,
  DeleteMemberRole,
} from "../controllers/Project.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createprojectValidator,
  addMemberToProjectValidator,
} from "../validators/index.js";
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";

const router = Router();
router.use(verifyJWT); //every route need verifyJWT thatswhy

router
  .route("/")
  .get(getproject)
  .post(createprojectValidator(), validate, CreateProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole))
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createprojectValidator(),
    validate,
    UpdateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), DeleteProject);

router
.route("/:projectId/members")
.get(GetMemberToproject)
.post(validateProjectPermission([UserRolesEnum.ADMIN]),
addMemberToProjectValidator(),
validate,
AddMemberToproject
)

router
.route("/:projectId/members/:userId")
.put(validateProjectPermission([UserRolesEnum.ADMIN]),UpdateMemberRole)
.delete(validateProjectPermission([UserRolesEnum.ADMIN]),DeleteMemberRole)


export default router;
