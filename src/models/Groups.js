const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupsSchema = new Schema({
  groupName: String,
  students: Array,
  admin: String,
});

module.exports = mongoose.model('Groups', GroupsSchema);
