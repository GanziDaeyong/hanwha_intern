$("#_0201_button_log").click(function () {
  GetHistory();
});

$("#_0501_button_update").click(function () {
  CheckTxBuffer();
  GetHistory();
});

async function GetHistory() {
  // let PENDING_NUM = 0; // PENDING LOGIC
  let obj = await _GetAll();
  console.log("From Log");
  console.log(obj);
  const currIdx = obj["currAcc"];
  let history = obj["accList"][currIdx]["history"];
  const txBuf = obj["txbuf"];

  let pendingMsg = "";
  for (let i = 0; i < txBuf.length; i++) {
    if (
      txBuf[i].txStatus == -1 &&
      txBuf[i].from == obj["accList"][currIdx]["address"]
    ) {
      pendingMsg += "<strong>[Pending..]</strong><br>" + txBuf[i].txHash + "\n";
    }
  }

  let msg = "";
  for (let hist of history) {
    let eachHis =
      "<br>===============================================<br><strong>[" +
      hist.txStatus +
      "]</strong>" +
      "<br>time - " +
      hist.time +
      "<br>type - " +
      hist.txType +
      "<br>to - " +
      hist.to +
      "<br>amount - " +
      hist.amount +
      " " +
      hist.currencyType;

    // const linkToEtherscan =
    //   "https://ropsten.etherscan.io/token/" + eachTokList[3];
    // const a = '<a href="' + linkToEtherscan + '" target="_blank">';
    // const b = eachTokList[0] + "(" + eachTokList[1] + "): " + eachTokList[2];
    // const c = "</a><br/>";

    if (hist.to.includes("http")) {
      eachHis = eachHis.replace("<br>to - ", '<br><a href="');
      eachHis = eachHis.replace(
        "<br>amount",
        '" target="_blank">Check Info From Etherscan</a><br>amount'
      );
    }
    console.log(eachHis);
    msg += eachHis;
  }
  msg = pendingMsg + msg;
  console.log(msg);
  _SendMsg("_0501", msg);
}

function _GetIdx(accList, address) {
  let res;
  for (let i = 0; i < accList.length; i++) {
    if (accList[i]["address"] == address) {
      res = i;
      break;
    }
  }
  console.log(res);
  return res;
}

async function CheckTxBuffer() {
  let obj = await _GetAll();
  console.log(obj);
  const txBuf = obj["txbuf"];
  const currIdx = obj["currAcc"];
  let changed = false;

  let PENDING_NUM = 0;

  for (let i = 0; i < txBuf.length; i++) {
    const fromAddress = txBuf[i]["from"];
    const eachIdx = _GetIdx(obj["accList"], fromAddress);
    if (txBuf[i].txStatus == -1) {
      PENDING_NUM += 1;
      const status = await _CheckTxStatus(txBuf[i].txHash);
      if (status == 1) {
        obj["txbuf"][i].txStatus = "Success";
        obj["accList"][eachIdx]["history"].push(obj["txbuf"][i]); //
        changed = true;
      } else if (status == 0) {
        // txBuf[i].txStatus = "fail";
        obj["txbuf"][i].txStatus = "fail";

        obj["accList"][eachIdx]["history"].push(obj["txbuf"][i]);
        changed = true;
      }
    }
    // TODO: EXCEPTION HANDLED
  }
  if (changed) {
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
    });
  }
  if (txBuf.length != 0 && PENDING_NUM === 0) {
    obj["txbuf"] = [];
    chrome.storage.sync.set(obj, function () {
      console.log("TxBuffer Emptied");
      console.log(obj);
    });
  }
}
