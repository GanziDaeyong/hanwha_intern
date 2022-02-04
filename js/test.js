$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  _SendMsg("_0401");
});

$("#_0401_button_validate").click(function () {
  const toAddress = $("#_0401_input_receipient").val();
  const amount = $("#_0401_input_amount").val();
  ValidateSendInfo(toAddress, amount);
});

$("#_0402_button_confirm").click(function () {
  SendTx();
});

async function ValidateSendInfo(toAddress, amount) {
  var BN = web3.utils.BN;

  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const fromBalance = await _GetBalance(fromAddress);

  // Check Address
  const isValidAddress = web3.utils.isAddress(toAddress);
  if (!isValidAddress) {
    alert("Invalid Address");
    return;
  }

  // Get Expected Gas
  const gasPrice = await _GetAvgGasPrice();
  const gasLimit = 21000;

  let gp = new BN(gasPrice);
  const gl = new BN(gasLimit);
  const expected = gp.mul(gl);

  gp = web3.utils.fromWei(expected.toString(10), "ether");
  // Check { Amount + Expected Gas <= Balance }
  const gas2eth = web3.utils.fromWei(expected.toString(10), "ether");
  const total = parseFloat(amount) + parseFloat(gas2eth);

  const isBalanceEnough = parseFloat(total) <= parseFloat(fromBalance);
  if (!isBalanceEnough) {
    alert("Not enough balance");
    return;
  }

  if (isValidAddress && isBalanceEnough) {
    alert("Validated");
    let msg =
      "sender address\n[" +
      fromAddress +
      "]\n\nreceipient address\n[" +
      toAddress +
      "]\n\namount\n[" +
      amount +
      "]\n\ngas price\n[" +
      gp +
      "]\n\ntotal gas\n[" +
      gas2eth +
      "]\n\ntotal amount\n[" +
      total +
      "]\n";
    _SendMsg("_0402", msg);
  }
}

async function _GetAvgGasPrice() {
  let gasprice = await web3.eth.getGasPrice();
  return gasprice;
}

async function SendTx() {
  let text = $("#screen").text();
  text = text.split("]");
  for (let i = 0; i < text.length; i++) {
    let idx = text[i].indexOf("[");
    text[i] = text[i].substring(idx + 1);
  }

  const fromAddress = text[0];
  const toAddress = text[1];
  const amount = text[2];
  const gasPrice = text[3];

  const pw = await _GetWalletPW();
  console.log(pw);
  const walletobj = web3.eth.accounts.wallet.load(pw);
  const pk = walletobj[fromAddress].privateKey;
}
// const fromAddress = document.getElementById("send_fromaddress").value;
// const toAddress = document.getElementById("send_toaddress").value;
// const privateKeyInput = document.getElementById("send_privatekey").value;
// const privateKey = Buffer.from(privateKeyInput, "hex");

// web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
//   const txObject = {
//     nonce: web3.utils.toHex(txCount),
//     to: toAddress,
//     value: web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
//     gasLimit: web3.utils.toHex(21000),
//     gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
//   };

//     const tx = new ethereumjs.Tx(txObject);
//     tx.sign(privateKey);

//     const serializedTx = tx.serialize();
//     const raw = "0x" + serializedTx.toString("hex");

//     web3.eth.sendSignedTransaction(raw, (err, txHash) => {
//       let msg =
//         "\n\n" +
//         get_time() +
//         " 송금" +
//         "\n[" +
//         fromAddress +
//         "] 에서\n[" +
//         toAddress +
//         "] 로 0.01 eth 송금함.\n트랜잭션 해시 [" +
//         txHash +
//         "]";
//       let redirect =
//         "\n이더스캔에서 확인하기 -> https://ropsten.etherscan.io/tx/" +
//         String(txHash);
//       document.getElementById("executionRes").innerText += msg + redirect;
//     });
//   });
// }
