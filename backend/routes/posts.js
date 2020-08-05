const express = require("express");

const PostsController = require("../controllers/posts");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/extract-file");

const router = express.Router();

router.get("/:id", PostsController.getOne);

router.get("", PostsController.getAll);

router.post("", checkAuth, extractFile, PostsController.post);

router.put("/:id", checkAuth, extractFile, PostsController.update);

router.delete("/:id", checkAuth, PostsController.delete);

module.exports = router;
