const Subject = require('../models/Subject');

exports.getSubjects = (req, res) => {
  // eslint-disable-next-line array-callback-return
  Subject.find((err, docs) => {
    res.render('subjects', { subjects: docs });
  });
};
