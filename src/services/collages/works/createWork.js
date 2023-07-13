import Work from "./../../../models/workModel.js";
import Collage from "../../../models/collageModel.js";
import createError from "../../../utils/error.js";
import responseSuccess from "../../../utils/responseSuccess.js";
import cache from "memory-cache";
import axios from "axios";
import FormData from "form-data";
import fs from "fs-extra";
import path from "path";

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
      thumbnail: "sfsdf",
      delete_url: "ssfdsf",
      detailcollage: collageId,
      createdAt: Date.now(),
    });

    try {
      //* Validasi data work
      await work.validate();
      if (req.file && req.file.buffer) {
        const base64Image = req.file.buffer.toString("base64");
        console.log(base64Image);
        const formData = new FormData();
        formData.append("image", base64Image);
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=e72ac0f2f6f52e884f10060a27e8919c`,
          formData,
          { headers: formData.getHeaders() }
        );

        console.log(response);
        work.thumbnail = response.data.data.url;
        work.delete_url = response.data.data.delete_url;
        await work.save();
      }
    } catch (error) {
      console.log(error);
      let message;

      if (error.errors) {
        const errorProp = Object.keys(error.errors)[0];
        message = error.errors[errorProp].message;
      } else {
        message = error.message;
      }
      return next(createError(400, message));
    }

    //* Simpan data work ke database
    await work.save();

    //* Tambahkan reference dari data work ke collection collage
    collage.workcollage.push(work._id);
    collage.save();
    responseSuccess(res, work);
  } catch (error) {
    console.log(error);
    //! Handle error ketika data collage tidak ditemukan
    next(createError(500, "Server Error"));
  }
};

export default createWork;
