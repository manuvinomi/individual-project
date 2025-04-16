const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment
} = require('../controllers/post.controller');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Post CRUD operations
router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// Post likes
router.route('/:id/like')
  .post(protect, likePost);

// Post comments
router.route('/:id/comments')
  .post(protect, addComment);

router.route('/:id/comments/:commentId')
  .delete(protect, deleteComment);

module.exports = router;
