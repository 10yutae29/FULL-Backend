const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const client = require("../db");

// DB에 kakao_id로 유저정보 받아오기
const getUserInfo = async (kakao_id) => {
  const result = await client.query("SELECT * FROM member WHERE kakao_id=$1", [
    kakao_id,
  ]);
  return result;
};
// DB에 유저정보 없을 때 회원가입
const SignIn = async (payload) => {
  await client.query(
    "INSERT INTO member(kakao_id,nickname,last_login_at) VALUES($1,$2,now())",
    payload
  );
};
// 최근 로그인 시간 업데이트
const updateLastLogedIn = async (id) => {
  await client.query("UPDATE member SET last_login_at = NOW() WHERE id = $1", [
    id,
  ]);
};

// 카카오 소셜 로그인
router.post("/login", async (req, res) => {
  try {
    // 프론트에서 인가토큰 받아와서 access_token 발급
    const REST_API_KEY = process.env.REST_API_KEY;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const params = {
      grant_type: "authorization_code",
      client_id: REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      code: req.body.code,
    };
    const resp = await axios({
      url: `https://kauth.kakao.com/oauth/token`,
      method: "post",
      data: params,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    const { access_token } = resp.data;

    //이제 access_token으로 유저정보 받기
    const resp2 = await axios({
      method: "get",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    // 유저정보 DB에서 가져오고 없으면 회원가입
    let userInfo = await getUserInfo(resp2.data.id);
    if (userInfo.rowCount === 0) {
      await SignIn([resp2.data.id, resp2.data.properties.nickname]);
      userInfo = await getUserInfo(resp2.data.id);
    }
    updateLastLogedIn(userInfo.rows[0].id);
    // 서버용 jwt토큰 만들기
    const jwtToken = jwt.sign(
      {
        id: userInfo.rows[0].id,
        kakao_id: userInfo.rows[0].kakao_id,
        nickname: userInfo.rows[0].nickname,
      },
      process.env.SECRET_KEY,
      { expiresIn: "20m" }
    );
    const refreshJwtToken = jwt.sign(
      {
        id: userInfo.rows[0].id,
        kakao_id: userInfo.rows[0].kakao_id,
        nickname: userInfo.rows[0].nickname,
      },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );
    res.set({
      Authorization: `Bearer ${jwtToken}`,
      RefreshToken: refreshJwtToken,
      "Access-Control-Expose-Headers": "Authorization, RefreshToken",
    });
    const payload = userInfo.rows[0];
    res.status(200).json(payload);
  } catch (e) {
    console.log(e);
  }
});

// 유저 정보 받아오는 로직
router.get("/info", async (req, res) => {
  //나중에 미들웨어가 될 accesstoken 검증식
  const accesstoken = req.headers.authorization.replace("Bearer ", "");
  const decode = jwt.verify(accesstoken, process.env.SECRET_KEY);
  const now = new Date().getTime();

  if (decode.exp * 1000 - now <= 0) {
    // 만료됐다면
    res.status(401).send();
  } else {
    const userInfo = await getUserInfo(decode.kakao_id);
    const payload = userInfo.rows[0];
    delete payload.kakao_id;
    res.status(200).json(payload);
  }
});

// 로그아웃 로직
// router.get("/logout", async (res, res) => {
//   const accesstoken = req.headers.authorization.replace("Bearer ", "");
//   const decode = jwt.verify(accesstoken, process.env.SECRET_KEY);
// });
module.exports = router;
