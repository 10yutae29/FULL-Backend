const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
require("dotenv").config();

const client = require("../db");

router.get("/", async (req, res) => {
  let data;
  if (req.query.id) {
    const response = await client.query(
      "SELECT title, content, article.created_at, member.nickname, member.id AS user_id, article.id AS article_id FROM article JOIN member ON writer_id=member.id WHERE article.id=$1",
      [req.query.id]
    );
    data = response.rows[0];
  } else {
    const response = await client.query(
      "SELECT article.id, title, content, article.created_at, member.nickname FROM article JOIN member ON writer_id=member.id "
    );
    data = response.rows;
  }
  res.json(data);
});

router.post("/", authMiddleware, async (req, res) => {
  const accesstoken = req.headers.authorization.replace("Bearer ", "");
  const decode = jwt.verify(accesstoken, process.env.SECRET_KEY);
  const now = new Date().getTime();

  if (decode.exp * 1000 - now <= 0) {
    // 만료됐다면
    res.status(401).send();
  } else {
    const id = decode.id;
    const response = await client.query(
      "INSERT INTO article(title,content,writer_id) VALUES($1,$2,$3) RETURNING id;",
      [req.body.title, req.body.content, id]
    );

    res.status(200).json({ id: response.rows[0].id });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const decode = req.user;
    // body에 게시글 작성자
    const article_id = req.params.id;
    const response = await client.query(
      "UPDATE article SET title = $1, content = $2 WHERE id=$3 AND writer_id=$4 RETURNING *",
      [req.body.title, req.body.content, article_id, decode.id]
    );
    if (!response)
      res.status({ message: "게시물을 찾을 수 없거나 권한이 없습니다." });
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "서버에러", err });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    const article_id = req.query.article_id;
    const user_id = req.query.user_id;
    const decode = req.user;

    if (decode.id == user_id) {
      const response = await client.query("DELETE FROM article WHERE id=$1", [
        article_id,
      ]);
      if (response.rowCount == 0) {
        res.status(404).send({ message: "Resource not found" });
      }
      res.status(200).send({ message: "Successfully Deleted!" });
    } else {
      res.status(403).json({
        status: 403,
        message: "You do not have permission to delete this post.",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
