const mongoose = require('mongoose');

const commSchema = new mongoose.Schema({
  name: String
});

const Community = mongoose.model('Community', commSchema);
module.exports = Community;
