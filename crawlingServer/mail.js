import nodemailer from "nodemailer";

export const mail = (msg, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "waffleshattlebus@gmail.com",
      pass: "xivygdorbsvzxdje",
    },
  });

  let mailOptions = {
    from: "eunseezi@gmail.com",
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
