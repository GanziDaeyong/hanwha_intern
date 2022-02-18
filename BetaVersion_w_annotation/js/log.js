$("#_0201_button_log").click(function () {
  GetHistory();
});
$("#_0501_button_update").click(function () {
  CheckTxBuffer();
  GetHistory();
});

/**
 * Get history from extension storage, and parse it.
 * @async
 * @function GetHistory
 */
async function GetHistory() {
  let obj = await _GetAll();
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
      "<br>=============================================<br><strong>[" +
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

    if (hist.to.includes("http")) {
      eachHis = eachHis.replace("<br>to - ", '<br><a href="');
      eachHis = eachHis.replace(
        "<br>amount",
        '" target="_blank">Check Info From Etherscan</a><br>amount'
      );
    }
    msg += eachHis;
  }
  msg = pendingMsg + msg;
  _SendMsg("_0501", msg);
}
/**
 * Check Transaction Buffer. Check transaction status for pending ones, then update account's history according to the status.
 * @async
 * @function CheckTxBuffer
 */
async function CheckTxBuffer() {
  let obj = await _GetAll();
  const txBuf = obj["txbuf"];
  let newTxBuf = [];
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
        obj["txbuf"][i].txStatus = "fail";
        obj["accList"][eachIdx]["history"].push(obj["txbuf"][i]);
        changed = true;
      } else {
        newTxBuf.push(obj["txbuf"][i]);
      }
    }
  }
  if (changed) {
    obj["txbuf"] = newTxBuf;
    chrome.storage.sync.set(obj, function () {});
  }
}
