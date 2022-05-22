const Community = require('../models/Community');

exports.getComm = (req, res) => {
  // eslint-disable-next-line array-callback-return
  Community.find((err, docs) => {
    res.render('community', { community: docs });
  });
};
