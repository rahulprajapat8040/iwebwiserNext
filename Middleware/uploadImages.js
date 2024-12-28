const multer = require("multer");
const cloudinary = require("cloudinary");
const { Readable } = require("stream");

// Initialize Express app

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: "dtkgbprka",
  api_key: "341446386324256",
  api_secret: "84uTXhkyP1oPYkFpJx8l6uyqwDU",
});

// Multer configuration to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array("file"); // Handle multiple files with field name 'file'

// Controller to handle file upload
const uploadMedia = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).send("Error during file upload.");
    }

    const files = req.files; // Expecting multiple files here

    if (!files || files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    try {
      const uploadResults = [];

      // Process each file
      for (const file of files) {
        const buffer = file.buffer;

        // Determine the resource type based on the file type (image or video)
        const fileType = file.mimetype.split("/")[0]; // 'image' or 'video'
        const resourceType = fileType === "image" ? "image" : "video"; // Dynamically set resource type

        // Upload the file to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                return reject(error);
              }
              resolve(result);
            }
          );

          const readableStream = new Readable();
          readableStream.push(buffer);
          readableStream.push(null);
          readableStream.pipe(stream);
        });

        uploadResults.push({ url: uploadResult.secure_url });
      }

      // Respond with either a single object or an array of objects
      if (uploadResults.length === 1) {
        return res.json(uploadResults[0]); // Single file, return object
      } else {
        return res.json(uploadResults); // Multiple files, return array of objects
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      return res.status(500).send("Error uploading media.");
    }
  });
};


module.exports = {uploadMedia};