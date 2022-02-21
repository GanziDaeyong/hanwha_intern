import { crawl } from "./crawling.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { mail } from "./mail.js";

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

app.listen(3000, function () {
  console.log("start! express server on port 3000");
});

app.get("/api/address/:accountAddress", cors(), (req, res) => {
  const accountAddress = req.params.accountAddress;
  crawl(accountAddress, res);
});

app.post("/api/feedback", cors(), (req, res) => {
  const msg = req.body.msg;
  mail(msg, res);
});
