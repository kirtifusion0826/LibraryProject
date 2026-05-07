const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================
// MongoDB Connection
// =====================
mongoose.connect("mongodb://127.0.0.1:27017/libraryDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// =====================
// Schemas
// =====================
const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  image: String,
  count: { type: Number, default: 1 }
});

const RequestSchema = new mongoose.Schema({
  bookTitle: String,
  requestedBy: String,
  date: { type: Date, default: Date.now }
});

// Models
const Book = mongoose.model("Book", BookSchema);
const Request = mongoose.model("Request", RequestSchema);

// =====================
// Multer Setup (Image Upload)
// =====================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// =====================
// ADD BOOK (with image)
// =====================
// =====================
// ADD BOOK (with image)
// =====================
app.post("/api/books", upload.single("image"), async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Title and Author required" });
    }

    const existingBook = await Book.findOne({
      title: new RegExp("^" + title + "$", "i")
    });

    if (existingBook) {
      existingBook.count += 1;
      await existingBook.save();

      return res.json({
        message: "Book already exists. Count updated.",
        book: existingBook
      });
    }

    const newBook = new Book({
      title,
      author,
      image: req.file ? req.file.filename : null,
      count: 1
    });

    await newBook.save();

    res.json({
      message: "Book added successfully",
      book: newBook
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// GET ALL BOOKS
// =====================
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// UPDATE BOOK
// =====================
app.put("/api/books/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(updatedBook);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// DELETE BOOK
// =====================
app.delete("/api/books/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// REQUEST BOOK
// =====================
app.post("/api/request/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.count += 1;
    await book.save();

    const newRequest = new Request({
      bookTitle: book.title,
      requestedBy: req.body.requestedBy || "Student"
    });

    await newRequest.save();

    res.json({ message: "Book Requested Successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// START SERVER
// =====================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});