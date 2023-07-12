import Work from "./../../../models/workModel.js";
import Collage from "../../../models/collageModel.js";
import createError from "../../../utils/error.js";
import responseSuccess from "../../../utils/responseSuccess.js";
import cache from "memory-cache";
import axios from "axios";
import FormData from "form-data";

const createWork = async (req, res, next) => {
  try {
    const { collageId } = req.params;
    const { title, desc, link } = req.body;

    //* Cek Data collage
    const collage = await Collage.findById(collageId);

    if (!collage) {
      next(
        createError(
          404,
          "Maaf, data yang Anda minta tidak dapat ditemukan di server kami."
        )
      );
    }

    //* Buat data work baru
    const work = new Work({
      title,
      desc,
      link,
      detailcollage: collageId,
      createdAt: Date.now(),
    });

    try {
      //* Validasi data work
      await work.validate();
      if (req.file) {
        const filePath = req.file.path;
        console.log(filePath);
        const formData = new FormData();
        formData.append("image", filePath);
        try {
          const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=e72ac0f2f6f52e884f10060a27e8919c`,
            formData,
            { headers: formData.getHeaders() }
          );

          if (response.data && response.data.success) {
            work.thumbnail = response.data.data.url;
            work.delete_url = response.data.data.delete_url;
            await work.save();
          } else {
            throw new Error("Upload gagal!");
          }
        } catch (error) {
          console.log(error.response.data.error);
          return next(createError(400, "Upload gagal!"));
        }
      }
    } catch (error) {
      const errors = error.errors;
      let message;

      const requiredProps = ["title", "desc", "link", "thumbnail"];
      const errorProp = Object.keys(errors).find((prop) =>
        requiredProps.includes(prop)
      );

      if (errorProp) {
        message = errors[errorProp].message;
      } else {
        message = error.message;
      }
      return next(createError(400, message));
    }

    //* Simpan data work ke database
    await work.save();

    //* Tambahkan reference dari data work ke collection collage
    collage.workcollage.push(work._id);
    await collage.save();
    responseSuccess(res, work);
  } catch (error) {
    console.log(error);
    //! Handle error ketika data collage tidak ditemukan
    next(createError(500, "Server Error"));
  }
};

export default createWork;
