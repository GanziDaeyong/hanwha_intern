import { crawl } from "./crawling.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { mail } from "./mail.js";

// const express = require("express");

// express 는 함수이므로, 반환값을 변수에 저장한다.
let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

// 3000 포트로 서버 오픈
app.listen(3000, function () {
  console.log("start! express server on port 3000");
});

app.get("/api/address/:accountAddress", cors(), (req, res) => {
  const accountAddress = req.params.accountAddress;
  crawl(accountAddress, res);
});

app.post("/api/feedback", cors(), (req, res) => {
  console.log(req.body);
  const msg = req.body.msg;
  console.log(msg);
  mail(msg, res);
});
