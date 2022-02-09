import { crawl } from "./crawling.js";
import express from "express";
import cors from "cors";
// const express = require("express");

// express 는 함수이므로, 반환값을 변수에 저장한다.
let app = express();

// 3000 포트로 서버 오픈
app.listen(3000, function () {
  console.log("start! express server on port 3000");
});

app.get("/api/address/:accountAddress", cors(), (req, res) => {
  const accountAddress = req.params.accountAddress;
  //   console.log(tokenaddress);
  crawl(accountAddress, res);
  // console.log(k);
  //   res.json({ ok: true, user: user });
});
