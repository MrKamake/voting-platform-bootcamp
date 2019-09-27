const User = require('../../models/User');
const Vote = require('../../models/Vote');

exports.getAll = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.getMyVotes = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.getOneVote = async (req, res, next) => {
  try {
    const selectedVote = await Vote.findOne({ _id: req.params.id });
    const createUser = await User.findOne({ _id: selectedVote.host });
    const selectedVoteDoc = JSON.parse(JSON.stringify(selectedVote));
    const expiration = new Date(selectedVoteDoc.expiration);
    const nowDate = new Date();
    const inProgress = Boolean(expiration - nowDate > 0);
    let hasVoted = false;
    let numberOfResult = 0;
    selectedVoteDoc.selections.forEach(selection => {
      console.log(selection);
      numberOfResult = Math.max(selection.people.length, numberOfResult);
      selection.people.forEach(person => {
        if (person === String(req.user._id)) {
          hasVoted = true;
        }
      });
    });
    const descriptionOfResult = selectedVoteDoc.selections.filter(selection => {
      if (selection.people.length === numberOfResult) {
        return selection;
      }
    });
    selectedVoteDoc.host = createUser.name;
    selectedVoteDoc.inProgress = inProgress;
    selectedVoteDoc.descriptionOfResult = descriptionOfResult;
    selectedVoteDoc.hasVoted = hasVoted;

    res.render('vote', { selectedVoteDoc, user: String(req.user._id) });
  } catch (err) {
    next(err);
  }
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

    res.redirect('/votings/success');
  } catch (err) {
    res.redirect('/votings/error');
  }
};

exports.update = async (req, res, next) => {
  try {
    const selectedVote = await Vote.findOne({ _id: req.params.id });

    selectedVote.selections.forEach(selection => {
      if (String(selection._id) === req.body.selection) {
        selection.people.push(req.user);
      }
    });
    await selectedVote.save();

    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await Vote.findByIdAndDelete(req.params.id);

    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
