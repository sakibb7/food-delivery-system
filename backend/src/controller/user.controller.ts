import { OK, UNAUTHORIZED } from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import { updateProfileSchema, updatePasswordSchema } from "./user.schemas.js";
import { updateProfile, changePassword } from "./user.services.js";
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
