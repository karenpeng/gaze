var mongoose = require('mongoose');

var recordSchema = mongoose.Schema({
  'eye': {
    type: Array
  },
  'date': {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Record', recordSchema);