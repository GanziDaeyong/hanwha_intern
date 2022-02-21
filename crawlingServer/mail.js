import nodemailer from "nodemailer";
import fs from "fs";

const readCredential = () => {
  try {
    const data = fs.readFileSync("./credential.out", "utf8");
    return data;
  } catch (err) {}
};

export const mail = (msg, res) => {
  const getCred = readCredential();
  const id = getCred.split("/")[0];
  const pw = getCred.split("/")[1];
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: id,
      pass: pw,
    },
  });

  let mailOptions = {
    from: "Wallet",
    to: "waffleshattlebus@gmail.com",
    subject: "[Wallet Feedback]",
    text: msg,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(500).json({});
    } else {
      res.status(200).json({});
    }
  });
};
