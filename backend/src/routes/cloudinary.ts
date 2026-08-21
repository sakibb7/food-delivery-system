import express from "express";
import cloudinary from "cloudinary";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Support both multipart file upload and JSON base64 buffer
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let uploadResult;

    if (req.file) {
      // Multipart file upload (from mobile app)
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      uploadResult = await cloudinary.v2.uploader.upload(dataUri, {
        folder: "tekina",
      });
    } else if (req.body?.buffer) {
      // Legacy JSON base64 upload (from web dashboard)
      uploadResult = await cloudinary.v2.uploader.upload(req.body.buffer, {
        folder: "tekina",
      });
    } else {
      res.status(400).json({ message: "No file or buffer provided" });
      return;
    }

    res.json({
      data: { url: uploadResult.secure_url },
      url: uploadResult.secure_url,
    });
  } catch (err: any) {
    console.log("Cloudinary upload error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// Keep the root POST for backward compatibility
router.post("/", upload.single("file"), async (req, res) => {
  try {
    let uploadResult;

    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      uploadResult = await cloudinary.v2.uploader.upload(dataUri, {
        folder: "tekina",
      });
    } else if (req.body?.buffer) {
      uploadResult = await cloudinary.v2.uploader.upload(req.body.buffer, {
        folder: "tekina",
      });
    } else {
      res.status(400).json({ message: "No file or buffer provided" });
      return;
    }

    res.json({
      data: { url: uploadResult.secure_url },
      url: uploadResult.secure_url,
    });
  } catch (err: any) {
    console.log("Cloudinary upload error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
