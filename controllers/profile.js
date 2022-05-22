const Profile = require('../models/Profile');

exports.getProfile = (req, res) => {
  // eslint-disable-next-line array-callback-return
  Profile.find((err, docs) => {
    res.render('profile', { profile: docs });
  });
};
