// middlewares/authMiddleware.js
require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided", action: 1 });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const now = new Date().getTime();
    if (decoded.exp * 1000 - now <= 0) {
      // 만료됐다면
      res.status(401).send({ message: "AccessToken was expired", action: 3 });
    }
    req.user = decoded; // 인증된 사용자 정보를 req.user에 추가
    req.accesstoken = token;
    next(); // 다음 미들웨어 또는 라우트 핸들러로 이동
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", action: 2 });
  }
};

module.exports = authMiddleware;
