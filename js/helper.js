// Web3 & Ethereum dependency
let web3 = new Web3(
  "https://ropsten.infura.io/v3/3c52917848e945229c0d33d632b10490"
);
let Buffer = ethereumjs.Buffer.Buffer;

console.log("!!!!!!!!!!!!!!!!!!");

// Goto Home page
$("#_home").click(function () {
  console.log("QQQQQQQQQQQQQQ");
  _SendMsg("_0201");
});

// Get current account's balance
$("#_balance").click(function () {
  console.log("dddd");
  // Send to Home and Append Balance
  let add = "0x5CCE38322F190EAB8Abc7Ceb23E816Cf7d3b48DC";
  let bal;
  let msg = "current account:\nbalance: ";
  _GetBalance(add).then((result) => {
    bal = result;
    msg = msg + bal;
    _SendMsg("_0201", msg);
  });
});

function _SendMsg(msg, src) {
  chrome.runtime.sendMessage({
    msg: msg,
    data: {
      screen: src,
    },
  });
}

function _StorageStruct(pw) {
  let oneAcc = {
    name: "No Account Created",
    address: "No Account Created",
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

function _PutStorage(accountObj) {
  chrome.storage.sync.get(null, function (res) {
    res["currAcc"]["address"] = accountObj.address;
  });
}

async function _GetBalance(accountAddress) {
  let getbalance = await web3.eth.getBalance(accountAddress);
  let balance = String(web3.utils.fromWei(getbalance, "ether"));
  return balance;
}
