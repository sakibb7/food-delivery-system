import { OK, UNAUTHORIZED } from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import { updateProfileSchema, updatePasswordSchema } from "./user.schemas.js";
import { updateProfile, changePassword, getAllUsers, toggleBanUser } from "./user.services.js";
import { getMyProfile } from "./auth.services.js";
import appAssert from "../utils/appAssert.js";

export const getProfileHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const user = await getMyProfile(userId);

  return res.status(OK).json({ user });
});

export const updateProfileHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const request = updateProfileSchema.parse(req.body);
  const updatedUser = await updateProfile(userId, request);

  return res.status(OK).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

export const changePasswordHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const request = updatePasswordSchema.parse(req.body);
  await changePassword(userId, request);

  return res.status(OK).json({
    message: "Password changed successfully",
  });
});

// ── Admin-only handlers ───────────────────────────────────────────────────────

export const adminGetAllUsersHandler = catchErrors(async (_req, res) => {
  const users = await getAllUsers();

  return res.status(OK).json({ users });
});

export const adminToggleBanUserHandler = catchErrors(async (req, res) => {
  const userId = Number(req.params.id);
  const adminUserId = req.userId as number;

  appAssert(userId, 400, "User ID is required");

  const user = await toggleBanUser(userId, adminUserId);

  return res.status(OK).json({
    message: user.status === "banned" ? "User has been banned" : "User has been unbanned",
    user,
  });
});
