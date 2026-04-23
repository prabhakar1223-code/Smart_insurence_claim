import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";

const app = express();
const port = 3000;

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ----------------------
// STORAGE SETTINGS
// ----------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ----------------------
// ROUTES
// ----------------------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Single image upload
app.post("/uploadImage", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded successfully",
    file: req.file
  });
});

// Multiple images upload
app.post("/uploadImages", upload.array("images", 5), (req, res) => {
  res.json({
    message: "Images uploaded successfully",
    files: req.files
  });
});

// Any files upload
app.post("/uploadFiles", upload.array("files"), (req, res) => {
  res.json({
    message: "Files uploaded successfully",
    files: req.files
  });
});

// ----------------------
// START SERVER
// ----------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
