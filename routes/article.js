const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
require("dotenv").config();

const articleController = require("../controllers/article.controller");

router.get("/", articleController.getArticles);
router.post("/", authMiddleware, articleController.postArticle);
router.delete("/", authMiddleware, articleController.deleteArticle);
router.put("/:id", authMiddleware, articleController.putArticle);

module.exports = router;
