import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {

  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState("all");

  // ⭐ ADDED: Page Title (UPPER PART)
  useEffect(() => {
    document.title = "Library Management System";
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ Fetch books
  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/books");
      setBooks(res.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching books");
    }
  };

  // ✅ Add book
  const addBook = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/books", formData);

      alert("Book added successfully");

      // clear input
      setTitle("");
      setAuthor("");
      setImage(null);

      fetchBooks();
    } catch (error) {
      console.error(error);
      alert("Error adding book");
    }
  };

  // ✅ Delete book
  const deleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      alert("Book deleted successfully");
      fetchBooks();
    } catch (error) {
      console.error(error);
      alert("Error deleting book");
    }
  };

  // ✅ Request Book
  const requestBook = async (id) => {

    const confirmRequest = window.confirm("Do you want to request this book?");
    if (!confirmRequest) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/request/${id}`);

      console.log("Response:", res.data);

      if (res.data && res.data.message) {
        alert(res.data.message);
      } else {
        alert("Book requested successfully");
      }

      fetchBooks();

    } catch (error) {
      console.error(error);

      if (error.response && error.response.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error requesting book (check backend)");
      }
    }
  };

  // ✅ Filter books
  const filteredBooks = books.filter(book => {
    if (filter === "low") return book.count < 5;
    if (filter === "mid") return book.count >= 5 && book.count <= 10;
    return true;
  });

  return (
    <div style={{ padding: "20px" }}>

      <h1>📚 Library Management</h1>

      {/* Add Book */}
      <form onSubmit={addBook}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <button>Add Book</button>
      </form>

      <br />

      {/* Filter */}
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="low">Count less than 5</option>
        <option value="mid">Count 5 to 10</option>
      </select>

      <hr />

      {/* Books */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "20px"
      }}>

        {filteredBooks.map(book => (
          <div key={book._id} style={{
            border: "1px solid gray",
            padding: "10px"
          }}>

            <img
              src={`http://localhost:5000/uploads/${book.image}`}
              alt={book.title}
              width="150"
              height="150"
            />

            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>Count: {book.count}</p>

            <div className="button-group">

              <button onClick={() => requestBook(book._id)}>
                Request Book
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteBook(book._id)}
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default App;