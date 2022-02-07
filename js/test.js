$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  // console.log(web3.eth.accounts.wallet.load("1"));
  // chrome.storage.sync.get(null, function (obj) {
  //   console.log(obj.txbuf);
  // });
  CheckTxBuffer();
  // t();
});

$("#_0201_button_log").click(function () {
  GetHistory();
});

$("#_0501_button_update").click(function () {
  CheckTxBuffer();
  GetHistory();
});

// async function GetHistory() {
//   // let PENDING_NUM = 0; // PENDING LOGIC
//   let obj = await _GetAll();
//   console.log(obj);
//   const currIdx = obj["currAcc"];
//   let history = obj["accList"][currIdx]["history"];
//   const txBuf = obj["txbuf"];

//   let pendingMsg = "";
//   for (let i = 0; i < txBuf.length; i++) {
//     if (
//       txBuf[i].txStatus == -1 &&
//       txBuf[i].from == obj["accList"][currIdx]["address"]
//     ) {
//       pendingMsg += "[Pending]\n" + txBuf[i].txHash + "\n";
//     }
//   }

//   let msg = "";
//   for (let hist of history) {
//     let eachHis =
//       "[" +
//       hist.txStatus +
//       "]" +
//       "\ntime - " +
//       hist.time +
//       "\ntype - " +
//       hist.txType +
//       "\ncurrency - " +
//       hist.currencyType +
//       "\nto - " +
//       hist.to +
//       "\namount - " +
//       hist.amount +
//       "\n";
//     eachHis += "-------------------------\n";
//     msg += eachHis;
//   }
//   msg = pendingMsg + msg;
//   console.log(msg);
//   _SendMsg("_0501", msg);
// }

// function _GetIdx(accList, address) {
//   let res;
//   for (let i = 0; i < accList.length; i++) {
//     if (accList[i]["address"] == address) {
//       res = i;
//       break;
//     }
//   }
//   console.log(res);
//   return res;
// }

// async function CheckTxBuffer() {
//   let obj = await _GetAll();
//   console.log(obj);
//   const txBuf = obj["txbuf"];
//   const currIdx = obj["currAcc"];
//   let changed = false;

//   let PENDING_NUM = 0;

//   for (let i = 0; i < txBuf.length; i++) {
//     const fromAddress = txBuf[i]["from"];
//     const eachIdx = _GetIdx(obj["accList"], fromAddress);
//     console.log(txBuf[i].txHash);
//     if (txBuf[i].txStatus == -1) {
//       PENDING_NUM += 1;
//       console.log("DETECTED");
//       const status = await _CheckTxStatus(txBuf[i].txHash);
//       console.log(status);
//       if (status == 1) {
//         console.log("DETECTEDA");
//         obj["txbuf"][i].txStatus = "success";
//         obj["accList"][eachIdx]["history"].push(obj["txbuf"][i]); //
//         changed = true;
//       } else if (status == 0) {
//         txBuf[i].txStatus = "fail";
//         console.log("DETECTEDB");

//         obj["accList"][eachIdx]["history"].push(obj["txbuf"][i]);
//         changed = true;
//       }
//     }
//   }
//   if (changed) {
//     chrome.storage.sync.set(obj, function () {
//       console.log("Saved");
//       console.log(obj);
//     });
//   }
//   if (txBuf.length != 0 && PENDING_NUM === 0) {
//     obj["txbuf"] = [];
//     chrome.storage.sync.set(obj, function () {
//       console.log("TxBuffer Emptied");
//       console.log(obj);
//     });
//   }

// }
