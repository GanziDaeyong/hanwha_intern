function _SendMsg(msg, src) {
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
    balance: {
      eth: 0,
    },
    history: {
      type: "default",
      amount: 0,
      receiver: "default",
    },
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
  let getbalance = await web3.eth.getBalance(accountAddress);
  let balance = String(web3.utils.fromWei(getbalance, "ether"));
  return balance;
}

async function _GetCurr() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, function (res) {
        let idx = res["currAcc"];
        resolve(res["accList"][idx]);
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
    web3.eth.accounts.wallet.save(pw);
    console.log("created/loaded account was saved");
  });
}
