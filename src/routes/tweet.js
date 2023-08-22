import express from 'express';
import Tweet from '../models/Tweet.js';
import auth from '../middleware/auth.js';

const router = new express.Router();

router.post('/tweet', auth, async (req, res) => {
  const tweet = new Tweet({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await tweet.save();
    res.status(200).json(tweet);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/tweet/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const tweet = await Tweet.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    updates.forEach((update) => {
      tweet[update] = req.body[update];
    });

    await tweet.save();

    if (!tweet) {
      return res.status(404).send();
    }

    res.send(tweet);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/tweet/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (tweet.userId === req.body.id) {
      await tweet.deleteOne();
      res.status(200).json('tweet is deleted');
    } else {
      res.status(500).send(e);
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/timeline', auth, async (req, res) => {
  try {
    const timeLineTweets = await Promise.all(
      req.user.following.map((followerId) => {
        return Tweet.find({ owner: followerId }).populate('owner');
      })
    );

    const combinedTweets = timeLineTweets.flat();
    combinedTweets.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(combinedTweets);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/my-tweets', auth, async (req, res) => {
  try {
    const tweets = await Tweet.find({ owner: req.user._id });
    console.log(tweets);
    res.status(200).json(tweets);
  } catch (e) {
    res.status(500).send(e);
  }
});

export default router;
