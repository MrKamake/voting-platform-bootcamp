const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;

const voteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: objectId,
    ref: 'User'
  },
  expiration: {
    type: Date,
    required: true
  },
  selections: [
    {
      description: { type: String, required: true },
      people: [{ type: objectId, ref: 'User', required: true }]
    }
  ]
});

module.exports = mongoose.model('Vote', voteSchema);
