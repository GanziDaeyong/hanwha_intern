$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  console.log(web3.eth.accounts.wallet.load("1"));
  // CheckTxBuffer();
});

// function CheckTxBuffer() {
//   chrome.storage.sync.get(null, function (obj) {
//     console.log(obj);
//     const currIdx = obj["currAcc"];
//     let txBuf = obj["txbuf"];
//     console.log(txBuf);
//     let changed = false;

//     for (let i = 0; i < txBuf.length; i++) {
//       console.log(txBuf[i].txHash);
//       if (txBuf[i].txStatus == -1) {
//         if (CheckTxStatus(txBuf[i].txHash) == true) {
//           txBuf[i].txStatus = 1;
//           obj["accList"][currIdx]["history"].push(txBuf[i]);
//           changed = true;
//         } else if (CheckTxStatus(txBuf[i].txHash) == false) {
//           txBuf[i].txStatus = 0;
//           obj["accList"][currIdx]["history"].push(txBuf[i]);
//           changed = true;
//         }
//       }
//     }
//     if (changed) {
//       chrome.storage.sync.set(obj, function () {
//         console.log("Saved");
//         console.log(obj);
//       });
//     }
//   });
// }
// async function CheckTxStatus(txHash) {
//   const status = await web3.eth.getTransactionReceipt(txHash);
//   return status;
// }
