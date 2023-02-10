const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MainGroupSchema = new Schema({
  groupName: String,
  subGroup: Array,
});

module.exports = mongoose.model('MainGroup', MainGroupSchema);
