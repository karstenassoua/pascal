const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  name: String
});

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
