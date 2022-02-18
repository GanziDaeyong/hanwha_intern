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

async function _CheckPw(pw) {
  const inputPw = await _sha256(pw);
  const correctPw = await _GetWalletPW();
  if (inputPw == correctPw) return true;
  else return false;
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

async function _GetWalletObj(isCorrect, pw) {
  if (isCorrect != "correct") {
    pw = await _sha256(pw);
  }
  const walletobj = web3.eth.accounts.wallet.load(pw);
  return walletobj;
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

function _ValidateAdd(address) {
  if (address.length == 42) {
    if (address[0] == "0" && address[1] == "x") {
      if (_isAlnum(address)) {
        return address;
      }
    }
  }
  if (address.length == 40) {
    if (address[0] != "0" && address[1] != "x") {
      if (_isAlnum(address)) {
        return "0x" + address;
      }
    }
  }
  return "fail";
}

function _ValidatePk(pk) {
  console.log(pk.length);
  if (pk.length == 66) {
    if (pk[0] == "0" && pk[1] == "x") {
      if (_isAlnum(pk)) {
        return pk;
      }
    }
  }
  if (pk.length == 64) {
    if (pk[0] != "0" && pk[1] != "x") {
      console.log("camehere");
      if (_isAlnum(pk)) {
        return "0x" + pk;
      }
    }
  }
  return "fail";
}

function _isAlnum(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // if (code == )
      return false;
    }
  }
  return true;
}
async function _GetAvgGasPrice() {
  let gasprice = await web3.eth.getGasPrice();
  return gasprice;
}

/**
 * @async
 * @function _GetTokenAddress
 * @param  {string} currency
 */
async function _GetTokenAddress(currency) {
  const curr = await _GetCurr();
  const tokList = curr["balance"];
  let tokAddress = "";
  for (let eachTokList of tokList) {
    if (eachTokList[0] == currency) {
      tokAddress = eachTokList[3];
      break;
    }
  }
  return tokAddress;
}

function Loading() {
  let loadingImg = "<img id='loadingImg' src='../loading.svg'/>";
  $("#main_body").append(loadingImg);
  console.log(document.getElementById("main_body").innerHTML);
}
function UnLoading() {
  // $("#main_body").remove("#loadingImg");
  $("#loadingImg").remove();

  console.log(document.getElementById("main_body").innerHTML);
}
/**
 * sha256 for hashing password
 * @async
 * @function _sha256
 * @param  {string} message - string that should be hashed
 * @returns {string} hashed result
 */
async function _sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Get index of given address.
 * @function _GetIdx
 * @param  {list} accList - list of account objects from extension storage.
 * @param  {string} address - account address to match from accList.
 */
function _GetIdx(accList, address) {
  let res;
  for (let i = 0; i < accList.length; i++) {
    if (accList[i]["address"] == address) {
      res = i;
      break;
    }
  }
  return res;
}
