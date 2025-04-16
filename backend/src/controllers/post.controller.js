const Post = require('../models/Post');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Finding resource
  let query = Post.find(JSON.parse(queryStr));

  // Search by title or content
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query = query.or([
      { title: searchRegex },
      { content: searchRegex }
    ]);
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Post.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate author details
  query = query.populate({
    path: 'author',
    select: 'firstName lastName avatar'
  });

  // Populate comment user details
  query = query.populate({
    path: 'comments.user',
    select: 'firstName lastName avatar'
  });

  // Execute query
  const posts = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: posts.length,
    pagination,
    data: posts
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'author',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'comments.user',
      select: 'firstName lastName avatar'
    });

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add author to req.body
  req.body.author = req.user.id;

  const post = await Post.create(req.body);

  // Get the populated post to return
  const populatedPost = await Post.findById(post._id)
    .populate({
      path: 'author',
      select: 'firstName lastName avatar'
    });

  res.status(201).json({
    success: true,
    data: populatedPost
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is post author
  if (post.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this post`, 401));
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Get the populated post to return
  const populatedPost = await Post.findById(post._id)
    .populate({
      path: 'author',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'comments.user',
      select: 'firstName lastName avatar'
    });

  res.status(200).json({
    success: true,
    data: populatedPost
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is post author
  if (post.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this post`, 401));
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Check if already liked
  if (post.likes.includes(req.user.id)) {
    // Unlike post
    post.likes = post.likes.filter(like => like.toString() !== req.user.id);
  } else {
    // Like post
    post.likes.push(req.user.id);
  }

  await post.save();

  // Get the populated post to return
  const populatedPost = await Post.findById(post._id)
    .populate({
      path: 'author',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'comments.user',
      select: 'firstName lastName avatar'
    });

  res.status(200).json({
    success: true,
    data: populatedPost
  });
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Create new comment
  const newComment = {
    user: req.user.id,
    content: req.body.content
  };

  // Add to comments array
  post.comments.push(newComment);

  await post.save();

  // Get the populated post to return
  const populatedPost = await Post.findById(post._id)
    .populate({
      path: 'author',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'comments.user',
      select: 'firstName lastName avatar'
    });

  res.status(200).json({
    success: true,
    data: populatedPost
  });
});

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Find comment
  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.commentId}`, 404));
  }

  // Make sure user is comment author
  if (comment.user.toString() !== req.user.id && post.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this comment`, 401));
  }

  // Remove comment
  comment.remove();

  await post.save();

  // Get the populated post to return
  const populatedPost = await Post.findById(post._id)
    .populate({
      path: 'author',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'comments.user',
      select: 'firstName lastName avatar'
    });

  res.status(200).json({
    success: true,
    data: populatedPost
  });
});
