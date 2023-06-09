import Collage from "../../../models/collageModel.js";
import createError from "../../../utils/error.js";
import responseSuccess from "../../../utils/responseSuccess.js";

const getCollage = async (req, res, next) => {
  try {
    //* Load More
    let limit = parseInt(req.query.limit);

    //* Mencari data Mahasiswa dengan menggabungkan data karyanya
    const collage = await Collage.aggregate([
      {
        $lookup: {
          from: "works",
          localField: "workcollage",
          foreignField: "_id",
          as: "workcollage",
        },
      },
    ])
      //*Load More
      .limit(limit);

    //* response
    responseSuccess(res, collage);
  } catch (error) {
    //! Handle error
    next(createError(500, "Server Error"));
  }
};

export default getCollage
