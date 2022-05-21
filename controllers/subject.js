/**
 * GET /subjects
 * List all books.
 */
const Subject = require('../models/Subject');

exports.getBooks = (req, res) => {
  // eslint-disable-next-line array-callback-return
  Subject.find((err, docs) => {
    res.render('subjects', { subject: docs });
  });
};
