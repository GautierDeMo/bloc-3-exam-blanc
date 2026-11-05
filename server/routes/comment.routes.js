const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/comment.controller');
const verifyToken = require('../middleware/auth');

router.get('/', commentController.getAllArticleComments);
router.post('/', verifyToken, commentController.createArticleComment);

module.exports = router;
