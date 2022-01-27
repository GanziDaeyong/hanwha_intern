/*
	wallet.js

	지갑 관련 로직을 담당한다.
*/

// Web3 & Ethereum dependency
let web3 = new Web3(
  "https://ropsten.infura.io/v3/3c52917848e945229c0d33d632b10490"
);
let Buffer = ethereumjs.Buffer.Buffer;

// Login - Create wallet with password
$("#_0101_button_create").click(function () {
  // TODO: validation logic required for password
  let pw = $("#_0101_input_password").val();
  console.log(pw);
  MakeAndSaveWallet(pw);
});

// Login - Log in with password
$("#_0101_button_login").click(function () {
  let pw = $("#_0101_input_password").val();
  LoadWallet(pw);
});

function MakeAndSaveWallet(pw) {
  // create
  console.log("->" + pw);
  web3.eth.accounts.wallet.clear();
  web3.eth.accounts.wallet.create(0, "randomstring");
  // save on local
  if (web3.eth.accounts.wallet.save(pw)) {
    alert("wallet created & saved");
    SendMsg("_0201");
  } else {
    alert("wallet not created");
  }
  chrome.storage.sync.clear(function () {});
  //save at extension storage
  let saveinfo = StorageStruct(pw);
  chrome.storage.sync.set(saveinfo, function () {
    alert("wallet saved on extension");
  });
}

function LoadWallet(pw) {
  chrome.storage.sync.get(null, function (res) {
    console.log(res);
    // TODO: pw should be hashed
    if (res["walletpw"] != undefined && res["walletpw"] == pw) {
      alert(pw);
      alert("password correct");
      SendMsg("_0201");
    } else {
      alert("invalid password");
    }
  });
}

function SendMsg(msg, src) {
  chrome.runtime.sendMessage({
    msg: msg,
    data: {
      screen: src,
    },
  });
}

function StorageStruct(pw) {
  let oneAcc = {
    name: "default",
    balance: {
      eth: 0,
    },
    history: {
      type: "default",
      amount: 0,
      receiver: "default",
    },
  };

  let accList = [oneAcc];

  let walletPassword = pw;

  let tokenNameMapper = {};

  let transactionBuffer = [];

  let struct = {
    currAcc: oneAcc,
    accList: accList,
    walletpw: walletPassword,
    tnm: tokenNameMapper,
    txbuf: transactionBuffer,
  };

  return struct;
}
