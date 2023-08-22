import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = new express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find();
    const usersWithoutCurrent = users.filter((user) => user.id != req.user._id);

    res.status(200).json(usersWithoutCurrent);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow.followers.includes(req.user._id)) {
      await userToFollow.updateOne({
        $push: { followers: req.user._id },
      });

      await req.user.updateOne({ $push: { following: req.params.id } });
    } else {
      return res.status(403).json('Already Following this Profile');
    }
    return res.status(200).json('Profile Followed');
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put('/unfollow/:id', auth, async (req, res) => {
  try {
    const userToUnFollow = await User.findById(req.params.id);

    if (req.user.following.includes(req.params.id)) {
      await userToUnFollow.updateOne({
        $pull: { followers: req.user._id },
      });

      await req.user.updateOne({ $pull: { following: req.params.id } });
    } else {
      return res.status(403).json('Not following this Profile');
    }
    return res.status(200).json('Profile Unfollowed');
  } catch (e) {
    res.status(500).send(e);
  }
});

export default router;
