import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";

export const addRestaurent = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
  },
);
