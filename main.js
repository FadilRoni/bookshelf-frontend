const books = JSON.parse(localStorage.getItem("books")) || [];
const SAVED_EVENT = "saved-book";
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitButton = e.target.querySelector("button[type='submit']");
    const bookId = submitButton.getAttribute("id-edit");

    if (bookId) {
      updatedBook(bookId);
    } else {
      addBook();
    }
  });

  const searchForm = document.getElementById("searchBook");

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBooks();
  });

  document.dispatchEvent(new Event(RENDER_EVENT));
});

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = +new Date();

  const bookObject = generatedBookObject(
    generatedID,
    title,
    author,
    year,
    isComplete
  );
  books.push(bookObject);

  saveBookToStorage();

  document.getElementById("bookForm").reset();

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generatedBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "";

  books.forEach((bookItem) => {
    const bookElement = createBook(bookItem);
    if (!bookItem.isComplete) incompleteBookList.append(bookElement);
    else completeBookList.append(bookElement);
  });
});

function createBook(bookObject) {
  const title = document.createElement("h3");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.innerText = "Penulis: " + bookObject.author;

  const year = document.createElement("p");
  year.innerText = "Tahun: " + bookObject.year;

  const div = document.createElement("div");
  div.classList.add("bookItem");
  div.setAttribute("data-bookid", `${bookObject.id}`);
  div.append(title, author, year);

  const divElement = document.createElement("div");

  if (bookObject.isComplete) {
    const unMarkAsRead = document.createElement("button");
    unMarkAsRead.classList.add("undone");
    unMarkAsRead.innerText = "Belum Selesai Dibaca";

    unMarkAsRead.addEventListener("click", function () {
      unRead(bookObject.id);
    });

    divElement.append(unMarkAsRead);
  } else {
    const markAsRead = document.createElement("button");
    markAsRead.classList.add("done");
    markAsRead.innerText = "Selesai Dibaca";

    markAsRead.addEventListener("click", function () {
      read(bookObject.id);
    });

    divElement.append(markAsRead);
  }

  const deleteBook = document.createElement("button");
  deleteBook.classList.add("delete");
  deleteBook.innerText = "Hapus Buku";

  deleteBook.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  const editBook = document.createElement("button");
  editBook.classList.add("edit");
  editBook.innerText = "Edit Buku";

  editBook.addEventListener("click", function () {
    edit(bookObject.id);
  });

  divElement.append(deleteBook, editBook);
  div.append(divElement);

  return div;
}

function findBook(bookId) {
  const book = books.find((bookItem) => bookItem.id == bookId);
  return book;
}

function removeBook(bookId) {
  const bookTarget = books.findIndex((book) => book.id === bookId);

  if (bookTarget !== -1) {
    books.splice(bookTarget, 1);

    saveBookToStorage();

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

function read(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return "error";

  bookTarget.isComplete = true;

  saveBookToStorage();

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function unRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return "error";

  bookTarget.isComplete = false;

  saveBookToStorage();

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function edit(bookId) {
  const bookTarget = findBook(bookId);

  if (!bookTarget) {
    console.error("Book not found for ID:", bookId);
    return;
  }

  document.getElementById("bookFormTitle").value = bookTarget.title;
  document.getElementById("bookFormAuthor").value = bookTarget.author;
  document.getElementById("bookFormYear").value = bookTarget.year;
  document.getElementById("bookFormIsComplete").checked = bookTarget.isComplete;

  const submitButton = document.querySelector(
    "#bookForm button[type='submit']"
  );
  submitButton.innerText = "Update Buku";

  submitButton.setAttribute("id-edit", bookTarget.id);
  document.getElementById("bookFormTitle").focus();
}

function saveBookToStorage() {
  localStorage.setItem("books", JSON.stringify(books));
  document.dispatchEvent(new Event(SAVED_EVENT));
}

function updatedBook(bookId) {
  const bookTarget = findBook(bookId);

  console.log("Attempting to update book with ID:", bookId);
  if (!bookTarget) {
    console.error("Book not found for ID:", bookId);
    return;
  }

  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  bookTarget.title = title;
  bookTarget.author = author;
  bookTarget.year = year;
  bookTarget.isComplete = isComplete;

  saveBookToStorage();

  document.getElementById("bookForm").reset();

  const submitButton = document.querySelector("button[type='submit']");

  submitButton.innerHTML = `Masukkan Buku ke rak <span>Belum selesai dibaca</span>`;
  submitButton.removeAttribute("id-edit");

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase()
    .trim();

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTitle)
  );

  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  filteredBooks.forEach((bookItem) => {
    const bookElement = createBook(bookItem);
    if (!bookItem.isComplete) incompleteBookList.append(bookElement);
    else completeBookList.append(bookElement);
  });
}
