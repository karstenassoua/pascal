const Lesson = require('../models/Lesson');

exports.getLessons = (req, res) => {
  // eslint-disable-next-line array-callback-return
  Lesson.find((err, docs) => {
    res.render('lessons', { lessons: docs });
  });
};
