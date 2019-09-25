const Vote = require('../../models/VotingElement');

exports.createVote = async (req, res, next) => {
  try {
    const selections = req.body.selections.map(selection => {
      return { description: selection, people: [] };
    });
    const newVote = {
      title: req.body.title,
      host: req.user,
      expiration: req.body.expiration,
      selections
    };
    await new Vote(newVote).save();

    next();
  } catch (err) {
    next(err);
  }
};
