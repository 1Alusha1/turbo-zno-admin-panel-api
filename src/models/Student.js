const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  id: Number,
  username: String,
  group: String,
  subGroup: String,
});

module.exports = mongoose.model('Student', StudentSchema);
