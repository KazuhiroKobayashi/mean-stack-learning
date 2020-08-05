const Post = require("../models/post");

exports.getOne = (req, res, next) => {
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
};

exports.getAll = (req, res, next) => {
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
};

exports.post = (req, res, next) => {
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
};

exports.update = (req, res, next) => {
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
      if (result.n > 0) {
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
};

exports.delete = (req, res, next) => {
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
};
