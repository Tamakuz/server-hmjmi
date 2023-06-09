import Lecture from "../../models/lectureModel.js";
import Collage from "../../models/collageModel.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import createError from "../../utils/error.js";
import responseSuccess from "../../utils/responseSuccess.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { accessTokenSecret, refreshTokenSecret } = config;

    const lecture = await Lecture.findOne({ username: username });
    const collage = await Collage.findOne({ username: username });

    if (lecture) {

      if (!lecture.validPassword(password)) {
        next(createError(400, "Wrong Password"));
      }

      const lectureId = lecture._id;
      const lectureRole = lecture.role;
      const refreshToken = jwt.sign({ id: lectureId, role: lectureRole }, refreshTokenSecret, {
        expiresIn: "1d",
      });
      await lecture.updateOne({ refresh_token: refreshToken });
      responseSuccess(res, { refreshToken });
    }

    if (collage) {

      if (!collage.validPassword(password)) {
        next(createError(400, "Wrong Password"));
      }

      const collageId = collage._id;
      const collageRole = collage.role;
      const refreshToken = jwt.sign({ id: collageId, role: collageRole }, refreshTokenSecret, {
        expiresIn: "1d",
      });
      await collage.updateOne({ refresh_token: refreshToken });
      responseSuccess(res, { refreshToken });
    }

    if (!lecture || !collage) {
      next(createError(400, "Masukan username yang terdaftar"));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, "Server Error"));
  }
};

export default login;
