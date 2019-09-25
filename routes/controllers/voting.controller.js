const User = require('../../models/User');
const Vote = require('../../models/VotingElement');

exports.getAll = async (req, res, next) => {
  const voteList = await Vote.find();
  const voteInformation = await Promise.all(
    voteList.map(async vote => {
      const createUser = await User.findOne({ _id: vote.host });
      const voteDoc = JSON.parse(JSON.stringify(vote._doc));
      const expiration = new Date(vote.expiration);
      const nowDate = new Date();
      const inProgress = Boolean(expiration - nowDate > 0);

      voteDoc.host = createUser.name;
      voteDoc.inProgress = inProgress;

      return voteDoc;
    })
  );

  res.render('main', { voteInformation, title: 'Voting Platform main page' });
};

exports.getMyVote = async (req, res, next) => {
  const currentUserId = req.user._id;
  const voteList = await Vote.find({ host: currentUserId });
  const myVotes = await Promise.all(
    voteList.map(async vote => {
      const voteDoc = JSON.parse(JSON.stringify(vote._doc));
      const expiration = new Date(vote.expiration);
      const nowDate = new Date();
      const inProgress = Boolean(expiration - nowDate > 0);

      voteDoc.inProgress = inProgress;

      return voteDoc;
    })
  );
  res.render('myPage', { myVotes });
};

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

    res.render('success');
  } catch (err) {
    res.render('error');
  }
};
