$("#_0201_button_send").click(function () {
  AddOptionsForSend();
});
$("#_0401_button_validate").click(function () {
  const currency = $("#_0401_select_transition option:selected").val();
  const toAddress = $("#_0401_input_receipient").val();
  const amount = $("#_0401_input_amount").val();
  if (currency == "ether") {
    ValidateSendInfo_Ether(toAddress, amount);
  } else {
    ValidateSendInfo_Token(toAddress, amount, currency);
  }
});
$("#_0402_button_confirm").click(function () {
  SendTx();
});
/**
 * Provide list of currency types (that would be chosen as currency type for remitting)
 * @async
 * @function AddOptionsForSend
 */
async function AddOptionsForSend() {
  const curr = await _GetCurr();
  const tokList = curr["balance"];
  let options = "<option value=ether>ether</option>";
  for (let i = 0; i < tokList.length; i++) {
    options +=
      "<option value=" + tokList[i][0] + ">" + tokList[i][0] + "</option>";
  }
  _SendMsg("_0401", options);
}
/**
 * Validate information of Send Ether
 * @async
 * @function ValidateSendInfo_Ether
 * @param  {string} toAddress - receipient address
 * @param  {string} amount - amount of ether
 */
async function ValidateSendInfo_Ether(toAddress, amount) {
  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const fromBalance = await _GetBalance(fromAddress);

  const isValidAddress = web3.utils.isAddress(toAddress);
  if (!isValidAddress) {
    alert("Invalid Address");
    return;
  }
  toAddress = _ValidateAdd(toAddress);
  if (toAddress == "fail") {
    alert("Invalid Address");
    return;
  }

  const amountFixed = amount.toString();
  amount = Number(amount); // DO NOT CHANGE ORDER OF amountFixed and amount

  const MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  if (isNaN(amount) || amount <= 0.0 || amount < 1e-18 || amount > MAX_INT) {
    alert("Amount should be positive number, between 1e-18 ~ 1e+77");
    return;
  }

  // Get Expected Gas
  let gasPrice = await _GetAvgGasPrice();
  gasPrice = web3.utils.fromWei(gasPrice, "ether"); // toether
  const gasLimit = 21000;
  const expected = gasPrice * gasLimit;
  const total = parseFloat(amount) + parseFloat(expected);

  const isBalanceEnough = parseFloat(total) <= parseFloat(fromBalance);
  if (!isBalanceEnough) {
    alert("Not enough balance");
    return;
  }

  alert("Validated");

  const msg =
    "<br><strong>Currency Type</strong><br>[ether" +
    "]<br><br><strong>Sender Address</strong><br>[" +
    fromAddress +
    "]<br><br><strong>Receipient Address</strong><br>[" +
    toAddress +
    "]<br><br><strong>Amount</strong><br>[" +
    amountFixed +
    "]<br><br><strong>Gas Price</strong><br>[" +
    gasPrice +
    "]<br><br><strong>Gas Limit</strong><br>[" +
    gasLimit +
    "]<br><br><strong>Maximum Gas That Can Be Spent</strong><br>[" +
    expected +
    "]<br><br><strong>Total Amount</strong><br>[" +
    total +
    "]";
  _SendMsg("_0402", msg);
}
/**
 * Validate information of Send Token
 * @async
 * @function ValidateSendInfo_Token
 * @param  {string} toAddress - receipient address
 * @param  {string} amount - amount of token
 * @param  {string} currency - name of token
 */
async function ValidateSendInfo_Token(toAddress, amount, currency) {
  Loading();
  const isValidAddress = web3.utils.isAddress(toAddress);
  if (!isValidAddress) {
    UnLoading();
    alert("Amount is not a number");
    return;
  }

  const amountFixed = amount.toString();
  amount = Number(amount);

  const MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  if (isNaN(amount) || amount <= 0.0 || amount < 1e-18 || amount > MAX_INT) {
    alert("Amount should be positive number, between 1e-18 ~ 1e+77");
    UnLoading();
    return;
  }

  const update = await UpdateTokenBalance(1);
  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const tokList = curr["balance"];
  const fromBalance = await _GetBalance(fromAddress);

  const gasLimit = 50000;
  const gasPrice = web3.utils.fromWei(web3.utils.toWei("30", "gwei"), "ether");
  const expected = gasPrice * gasLimit;
  const isEnoughEther = fromBalance > expected;
  if (!isEnoughEther) {
    UnLoading();
    alert("ether not enough to pay transaction fee");
    return;
  }

  let tokBalance = 0;
  for (let eachTokList of tokList) {
    if (eachTokList[0] == currency) {
      tokBalance = eachTokList[2];
      break;
    }
  }
  const isEnoughToken = tokBalance > amount;
  if (!isEnoughToken) {
    UnLoading();
    alert("not enough token");
    return;
  }

  const total = amount + currency + " / " + expected + "eth";

  alert("Validated");
  const msg =
    "<br><strong>Currency Type</strong><br>[" +
    currency +
    "]<br><br><strong>Sender Address</strong><br>[" +
    fromAddress +
    "]<br><br><strong>Receipient Address</strong><br>[" +
    toAddress +
    "]<br><br><strong>Amount</strong><br>[" +
    amountFixed +
    "]<br><br><strong>Gas Price</strong><br>[" +
    gasPrice +
    "]<br><br><strong>Gas Limit</strong><br>[" +
    gasLimit +
    "]<br><br><strong>Maximum Gas That Can Be Spent</strong><br>[" +
    expected +
    "]<br><br><strong>total amount</strong><br>[" +
    total +
    "]";
  UnLoading();

  _SendMsg("_0402", msg);
}
/**
 * Send transaction (Send Ether) with validated data
 * @async
 * @function SendTx
 */
async function SendTx() {
  Loading();
  const text = $("#screen").text();
  text = text.split("]");
  for (let i = 0; i < text.length; i++) {
    let idx = text[i].indexOf("[");
    text[i] = text[i].substring(idx + 1);
  }
  const currencyName = text[0];
  const fromAddress = text[1];
  const toAddress = text[2];
  let amount = text[3];
  const gasPrice = text[4];

  const walletpw = await _GetWalletPW();
  const walletobj = await _GetWalletObj("correct", walletpw);
  let pk = walletobj[fromAddress].privateKey;
  pk = pk.substring(2);
  const privateKey = Buffer.from(pk, "hex");

  if (currencyName != "ether") {
    SendTok(currencyName, fromAddress, toAddress, amount, privateKey);
    return;
  }

  web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
    if (err != undefined) {
      alert(
        "[ERROR] Unknown error occurred while processing transaction count info. Detail: " +
          err
      );
      UnLoading();
      return;
    }

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

    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      if (err != undefined || txHash == undefined) {
        alert(
          "[ERROR] Unknown error occurred while sending transaction. Detail: " +
            err
        );
        UnLoading();
        return;
      }

      const toEtherscan = "https://ropsten.etherscan.io/tx/" + txHash;
      const time = _GetTimeSec();
      let msg =
        "<br><strong>Transaction Hash</strong><br>[" +
        txHash +
        "]<br><br><strong>Url To Etherscan</strong><br>[" +
        toEtherscan +
        "]";
      const txObj = _TxBufferStruct(
        "send",
        currencyName,
        txHash,
        fromAddress,
        toAddress,
        amount,
        time
      );
      _TxBufferPush(txObj);
      UnLoading();
      _SendMsg("_0402_2", msg);
    });
  });
}
/**
 * Send transcation (Send Token) with validated data
 * @async
 * @function SendTok
 * @param  {string} currencyName - name of token
 * @param  {string} fromAddress - sender address
 * @param  {string} toAddress - receipient address
 * @param  {string} amount - amount of token
 * @param  {string} privateKey - sender private key
 */
async function SendTok(
  currencyName,
  fromAddress,
  toAddress,
  amount,
  privateKey
) {
  const tokenAddress = await _GetTokenAddress(currencyName);

  const abiArray = abi;

  const contract = new web3.eth.Contract(abiArray, tokenAddress, {
    from: fromAddress,
  });
  const amountHex = web3.utils.toHex(web3.utils.toWei(amount, "ether"));
  const count = await web3.eth.getTransactionCount(fromAddress);
  const gasLimit = web3.utils.toHex(50000); // Raise the gas limit to a much higher amount
  const gasPrice = web3.utils.toHex(web3.utils.toWei("30", "gwei")); // 얘를 가져와서 쓰기

  const txObject = {
    from: fromAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: tokenAddress,
    value: "0x0",
    data: contract.methods.transfer(toAddress, amountHex).encodeABI(),
    chainId: 0x03, // 3 for ropsten
  };
  const tx = new ethereumjs.Tx(txObject, { chain: "ropsten" });
  tx.sign(privateKey);
  const serializedTx = tx.serialize();
  const raw = "0x" + serializedTx.toString("hex");
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    if (err != undefined || txHash == undefined) {
      alert(
        "[ERROR] Unknown error occurred while sending transaction. Detail: " +
          err
      );
      UnLoading();
      return;
    }
    alert("Transaction Sent");
    const toEtherscan = "https://ropsten.etherscan.io/tx/" + txHash;
    const time = _GetTimeSec();
    const msg =
      "<br><strong>Transaction Hash</strong><br>[" +
      txHash +
      ']<br><br><strong>URL to Etherscan</strong><br><a href="' +
      toEtherscan +
      '" target="_blank">click!</a><br>';
    const txObj = _TxBufferStruct(
      "send",
      currencyName,
      txHash,
      fromAddress,
      toAddress,
      amount,
      time
    );
    _TxBufferPush(txObj);
    UnLoading();
    _SendMsg("_0402_2", msg);
  });
}
