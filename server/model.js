var mongoose = require('mongoose');

var recordSchema = mongoose.Schema({
  'eye': {
    type: Array
  }
});

module.exports = mongoose.model('Record', recordSchema);