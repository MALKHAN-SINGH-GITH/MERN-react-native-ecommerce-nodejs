import multer from "multer";

// Configure multer to store uploaded files in memory
const storage = multer.memoryStorage();

// Handles single file uploads using memory storage
// Exports middleware that processes a single file field named "file"
export const singleupload = multer({ storage }).single("file");
