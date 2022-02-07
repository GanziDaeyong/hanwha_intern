$("#_0201_button_send").click(function () {
  _SendMsg("_0401");
});

$("#_0401_button_validate").click(function () {
  console.log("clicked");
  const toAddress = $("#_0401_input_receipient").val();
  const amount = $("#_0401_input_amount").val();
  ValidateSendInfo(toAddress, amount);
});

$("#_0402_button_confirm").click(function () {
  SendTx();
});

async function ValidateSendInfo(toAddress, amount) {
  //   var BN = web3.utils.BN;

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
  let gasPrice = await _GetAvgGasPrice();
  gasPrice = web3.utils.fromWei(gasPrice, "ether"); // toether
  const gasLimit = 21000;
  const expected = gasPrice * gasLimit;
  const total = parseFloat(amount) + parseFloat(expected);

  console.log(gasPrice);
  console.log(expected);

  const isBalanceEnough = parseFloat(total) <= parseFloat(fromBalance);
  if (!isBalanceEnough) {
    alert("Not enough balance");
    return;
  }

  if (isValidAddress && isBalanceEnough) {
    alert("Validated");
    let msg =
      "sender address[" +
      fromAddress +
      "]\n\nreceipient address[" +
      toAddress +
      "]\n\namount[" +
      amount +
      "]\n\ngas price[" +
      gasPrice +
      "]\n\ntotal gas[" +
      expected +
      "]\n\ntotal amount[" +
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
  const walletobj = web3.eth.accounts.wallet.load(pw);
  console.log(walletobj);
  console.log(pw);
  let pk = walletobj[fromAddress].privateKey;
  //TODO: Check how pk is saved
  pk = pk.substring(2);

  const privateKey = Buffer.from(pk, "hex");

  web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei(amount, "ether")),
      gasLimit: web3.utils.toHex(21000),
      gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "ether")),
    };

    const tx = new ethereumjs.Tx(txObject);
    tx.sign(privateKey);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");
    // const raw = serializedTx.toString("hex");

    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      console.log(err);
      console.log(txHash);
      alert("Transaction Sent");
      const toEtherscan = "https://ropsten.etherscan.io/tx/" + txHash;
      const time = _GetTimeSec();
      let msg =
        "transaction hash\n[" +
        txHash +
        "]\n\nurl to etherscan\n[" +
        toEtherscan +
        "]";
      _SendMsg("_0402_2", msg);
      const txObj = _TxBufferStruct(
        "send",
        "ether",
        txHash,
        fromAddress,
        toAddress,
        amount,
        time
      );
      _TxBufferPush(txObj);
    });
  });
}
