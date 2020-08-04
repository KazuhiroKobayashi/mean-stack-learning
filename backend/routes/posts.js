const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const ext = MIME_TYPE_MAP[file.mimetype];
    const name = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: "Post not found.",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching a post failed.",
      });
    });
});

router.get("", (req, res, next) => {
  const pageSize = Number(req.query.pagesize);
  const currentPage = Number(req.query.page);
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((posts) => {
      fetchedPosts = posts;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully.",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching posts failed.",
      });
    });
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    post
      .save()
      .then((post) => {
        res.status(201).json({
          message: "Post added successfully.",
          // post: {
          //   id: post.id,
          //   title: post.title,
          //   content: post.content,
          //   imagePath: post.imagePath,
          // },
          post: {
            ...post,
            id: post._id,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Creating a post failed.",
        });
      });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
      .then((result) => {
        if (result.nModified > 0) {
          res.status(200).json({
            message: "Post updated successfully.",
          });
        } else {
          res.status(401).json({
            message: "Not authorized.",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Updating a post failed.",
        });
      });
  }
);

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: "Post deleted successfully.",
        });
      } else {
        res.status(401).json({
          message: "Not authorized.",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Deleting a post failed.",
      });
    });
});

module.exports = router;
