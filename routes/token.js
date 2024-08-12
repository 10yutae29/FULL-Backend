const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.get("/refresh", (req, res) => {
  const refreshtoken = req.headers.refreshtoken;
  const decode = jwt.verify(refreshtoken, process.env.REFRESH_SECRET_KEY);
  const now = new Date().getTime();
  if (decode.exp * 1000 - now <= 0) {
    // 만료됐다면
    res.status(401).send();
  } else {
    const jwtToken = jwt.sign(
      {
        id: decode.id,
        kakao_id: decode.kakao_id,
        nickname: decode.nickname,
      },
      process.env.SECRET_KEY,
      { expiresIn: "20m" }
    );
    const refreshJwtToken = jwt.sign(
      {
        id: decode.id,
        kakao_id: decode.kakao_id,
        nickname: decode.nickname,
      },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );
    res.set({
      Authorization: `Bearer ${jwtToken}`,
      RefreshToken: refreshJwtToken,
      "Access-Control-Expose-Headers": "Authorization, RefreshToken",
    });
    res.status(200).send();
  }
});

module.exports = router;
