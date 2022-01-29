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

function _PutStorage(accountObj, isFirst) {
  console.log("putstorage came in");
  chrome.storage.sync.get(null, function (obj) {
    obj["currAcc"]["address"] = accountObj.address;
    if (isFirst) {
      obj["currAcc"]["name"] = _GetTime() + "created account";
    }
    console.log(obj);
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
    });
  });
}

async function _GetBalance(accountAddress) {
  let getbalance = await web3.eth.getBalance(accountAddress);
  let balance = String(web3.utils.fromWei(getbalance, "ether"));
  return balance;
}

async function _GetAddress() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, function (res) {
        resolve(res["currAcc"]["address"]);
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
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes();
  var dateTime = date + " " + time;
  return dateTime;
}
