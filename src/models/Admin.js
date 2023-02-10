const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  username: String,
  group: String,
  subGroup: String,
  ownGroups: Array,
  token: String,
  roles: [{ type: String, ref: 'Role' }],
});

module.exports = mongoose.model('Admin', AdminSchema);
