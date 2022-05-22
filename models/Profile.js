const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: String
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
