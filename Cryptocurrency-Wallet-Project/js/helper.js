function _SendMsg(msg, src) {
  console.log("sent");
  chrome.runtime.sendMessage({
    msg: msg,
    data: {
      screen: src,
      option: src,
    },
  });
}

function _StorageStruct(pw) {
  let struct = {
    currAcc: -1,
    accList: [],
    walletpw: pw,
    tnm: {},
    txbuf: [],
  };

  return struct;
}

function _CreateAccountRecord(name, address) {
  let oneAcc = {
    name: name,
    address: address,
    balance: [],
    history: [],
  };
  return oneAcc;
}

function _CheckDuplicate(address) {}

/*
function _PutStorage(accountObj, isFirst) {
  console.log("putstorage came in");
  chrome.storage.sync.get(null, function (obj) {

    let name = "";
    if (isFirst) name = "AccountCreatedAt_"+_GetTime();
    else name = "AccountLoadedAt_"+_GetTime();

    const address = accountObj.address;

    obj["currAcc"]["address"] = address;
    obj["currAcc"]["name"] = name;
    
    console.log(obj);

    let idx = obj["accList"].length
    let toPush = _CreateAccountRecord(name, address)
    obj["accList"].push(toPush);

    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
    });
  });
}
*/

function _PutStorage(accountObj, isFirst) {
  console.log("putstorage came in");
  chrome.storage.sync.get(null, function (obj) {
    let name = "";
    if (isFirst) name = "AccountCreatedAt_" + _GetTime();
    else name = "AccountLoadedAt_" + _GetTime();
    const address = accountObj.address;

    let toPush = _CreateAccountRecord(name, address);
    obj["accList"].push(toPush);
    obj["currAcc"] = obj["accList"].length - 1;

    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
    });
  });
}

async function _GetBalance_EtherAndToken(accountAddress) {
  let res = "";

  const getbalance = await web3.eth.getBalance(accountAddress);
  const ethBal = String(web3.utils.fromWei(getbalance, "ether"));
  res += "eth: " + ethBal + "\n";

  const curr = await _GetCurr();
  const tokList = curr["balance"];

  for (let eachTokList of tokList) {
    res += eachTokList[0] + "(" + eachTokList[1] + "): " + eachTokList[2];
    res += "\n";
  }

  return res;
}
async function _GetBalance_EtherAndTokenTest(accountAddress) {
  let res = "";

  const getbalance = await web3.eth.getBalance(accountAddress);
  const ethBal = String(web3.utils.fromWei(getbalance, "ether"));
  res += "eth: " + ethBal + "\n";

  const curr = await _GetCurr();
  const tokList = curr["balance"];

  for (let eachTokList of tokList) {
    const linkToEtherscan =
      "https://ropsten.etherscan.io/token/" + eachTokList[3];
    const a = '<a href="' + linkToEtherscan + '" target="_blank">';
    const b = eachTokList[0] + "(" + eachTokList[1] + "): " + eachTokList[2];
    const c = "</a><br/>";
    res += a + b + c;
  }

  return res;
}

async function _GetBalance(accountAddress) {
  const getbalance = await web3.eth.getBalance(accountAddress);
  const ethBal = String(web3.utils.fromWei(getbalance, "ether"));
  return ethBal;
}

async function _CheckTxStatus(txHash) {
  const status = await web3.eth.getTransactionReceipt(txHash);
  let res;
  try {
    res = status.status; // TODO: Null exception
    if (res == true) res = 1;
    if (res == false) res = 0;
  } catch (ex) {
    res = -1;
  }
  return res;
}

async function _GetCurr() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, function (res) {
        // console.log(res);
        let idx = res["currAcc"];
        resolve(res["accList"][idx]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function _GetAll() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, function (res) {
        resolve(res);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function _GetList() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, function (res) {
        resolve(res["accList"]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function _GetWalletPW() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, function (res) {
        resolve(res["walletpw"]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

// function _GetAddress() {
//   let add;
//   chrome.storage.sync.get(null, function (res) {
//     add = res["currAcc"]["address"];
//   });
//   return add;
//   // let a = chrome.storage.sync.get(null, _test(res));
//   // console.log(a);
//   // return add;
// }

function _GetTime() {
  var today = new Date();
  var date =
    today.getFullYear() +
    "" +
    (today.getMonth() + 1) +
    "" +
    today.getDate() +
    "" +
    today.getHours() +
    "" +
    today.getMinutes();
  return date;
}

function _SaveWalletWeb3js() {
  chrome.storage.sync.get(null, function (obj) {
    pw = obj["walletpw"];
    web3.eth.accounts.wallet.load(pw); // [CAUTION] SHOULD BE LOADED RIGHT BEFORE SAVING
    web3.eth.accounts.wallet.save(pw);
    console.log(web3.eth.accounts.wallet.load(pw));

    console.log("created/loaded account was saved");
  });
}

function _TxBufferStruct(txType, currencyType, txHash, from, to, amount, time) {
  console.log("instruct -> " + amount);
  let txRecord = {
    txStatus: -1, // -1 Pending   0 Rejected    1 Accepted
    txType: txType,
    currencyType: currencyType,
    txHash: txHash,
    from: from,
    to: to,
    amount: amount,
    time: time,
  };
  return txRecord;
}

function _TxBufferPush(txbufferstruct) {
  chrome.storage.sync.get(null, function (obj) {
    obj["txbuf"].push(txbufferstruct);
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
    });
  });
}

function _GetTimeSec() {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + " " + time;
  return dateTime;
}
