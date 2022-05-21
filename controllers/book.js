/**
 * GET /books
 * List all books.
 */
const Book = require('../models/Book');

exports.getBooks = (req, res) => {
  // eslint-disable-next-line array-callback-return
  Book.find((err, docs) => {
    res.render('books', { books: docs });
  });
};
