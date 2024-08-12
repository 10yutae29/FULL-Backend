const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.SERVER_PORT;
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 파일 시작
const loginRouter = require("./routes/user");
const tokenRouter = require("./routes/token");
const articleRouter = require("./routes/article");
// 라우터 연결
app.use("/token", tokenRouter);
app.use("/user", loginRouter);
app.use("/article", articleRouter);

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
