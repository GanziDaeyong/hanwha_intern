$("#_0201_button_send").click(function () {
  // _SendMsg("_0401");
  AddOptions_Send();
});

$("#_0401_button_validate").click(function () {
  console.log("clicked");
  const currency = $("#_0401_select_transition option:selected").val();
  const toAddress = $("#_0401_input_receipient").val();
  const amount = $("#_0401_input_amount").val();
  if (currency == "ether") {
    ValidateSendInfo_Ether(toAddress, amount);
    console.log("Its ether");
  } else {
    ValidateSendInfo_Token(toAddress, amount, currency);
    console.log("Its not ether");
  }
});

$("#_0402_button_confirm").click(function () {
  SendTx();
});

async function AddOptions_Send() {
  const curr = await _GetCurr();
  const tokList = curr["balance"];
  let options = "<option value=ether>ether</option>";
  for (let i = 0; i < tokList.length; i++) {
    options +=
      "<option value=" + tokList[i][0] + ">" + tokList[i][0] + "</option>";
    // $("#_0304_select_transition").append(selectOptions);
    // https://24hours-beginner.tistory.com/98
  }
  _SendMsg("_0401", options);
}

async function ValidateSendInfo_Token(toAddress, amount, currency) {
  // 0    preparation
  Loading();

  // 1    check toaddress
  const isValidAddress = web3.utils.isAddress(toAddress);
  if (!isValidAddress) {
    UnLoading();
    alert("Amount is not a number");

    return;
  }

  UnLoading();
  const amountFixed = amount.toString();
  amount = Number(amount);
  // if (isNaN(amount)) {
  //   alert("Invalid Amount");
  //   UnLoading();
  //   return;
  // }
  // const amountFixedSplit = amountFixed.split(".");
  // if (!Number.isInteger(amount) && amountFixedSplit.length == 2) {
  //   if (amountFixedSplit[1].length >= 19) {
  //     alert("Maximum 18 decimal (1 wei)");
  //     return;
  //   }
  // }
  const MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  // if (totalsupply <= 0.0 || !Number.isInteger(Number(totalsupply))) {
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
  Loading();

  // 2    check transaction fee
  const gasLimit = 50000;
  const gasPrice = web3.utils.fromWei(web3.utils.toWei("30", "gwei"), "ether");
  const expected = gasPrice * gasLimit;
  const isEnoughEther = fromBalance > expected;
  if (!isEnoughEther) {
    UnLoading();
    alert("ether not enough to pay transaction fee");
    return;
  }

  // 3    check token balance and total
  let tokBalance = 0;
  for (let eachTokList of tokList) {
    if (eachTokList[0] == currency) {
      // tokBalance = new BN(eachTokList[2]);
      tokBalance = eachTokList[2];
      break;
    }
  }
  //TODO: adjust balance
  // tokBalance /= 1e18;
  const isEnoughToken = tokBalance > amount;
  if (!isEnoughToken) {
    UnLoading();

    alert("not enough token");
    return;
  }

  const total = amount + currency + " / " + expected + "eth";

  if (isValidAddress && isEnoughEther && isEnoughToken) {
    alert("Validated");
    let msg =
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
}
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
  // console.log(amount);
  const amountFixed = amount.toString();
  const MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  amount = Number(amount); // DO NOT CHANGE ORDER OF amountFixed and amount
  if (isNaN(amount) || amount <= 0.0 || amount < 1e-18 || amount > MAX_INT) {
    alert("Amount should be positive number, between 1e-18 ~ 1e+77");
    UnLoading();
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
    // let msg =
    //   "currency type[ether" +
    //   "]\n\nsender address[" +
    //   fromAddress +
    //   "]\n\nreceipient address[" +
    //   toAddress +
    //   "]\n\namount[" +
    //   amount +
    //   "]\n\ngas price[" +
    //   gasPrice +
    //   "]\n\ngas limit[" +
    //   gasLimit +
    //   "]\n\ntotal gas[" +
    //   expected +
    //   "]\n\ntotal amount[" +
    //   total +
    //   "]\n";

    let msg =
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
}
async function _GetAvgGasPrice() {
  let gasprice = await web3.eth.getGasPrice();
  return gasprice;
}
async function SendTx() {
  Loading();
  let text = $("#screen").text();
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
  const pw = await _GetWalletPW();
  const walletobj = web3.eth.accounts.wallet.load(pw);

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
      // value: web3.utils.toHex(
      //   web3.utils.toBN(web3.utils.toWei(amount, "ether"))
      // ),
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

async function SendTok(
  currencyName,
  fromAddress,
  toAddress,
  amount,
  privateKey
) {
  const tokenAddress = await _GetTokenAddress(currencyName);

  const abiArray = abi;
  // const contractAddress = "0x71b217e399E3f2ac330a994D3bD68AE9731a7aF2";
  const contract = new web3.eth.Contract(abiArray, tokenAddress, {
    from: fromAddress,
  });
  const amountHex = web3.utils.toHex(web3.utils.toWei(amount, "ether"));
  const count = await web3.eth.getTransactionCount(fromAddress);
  const gasLimit = web3.utils.toHex(50000); // Raise the gas limit to a much higher amount
  const gasPrice = web3.utils.toHex(web3.utils.toWei("30", "gwei")); // 얘를 가져와서 쓰기
  // TODO: unifiy

  const txObject = {
    from: fromAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: tokenAddress,
    value: "0x0",
    data: contract.methods.transfer(toAddress, amountHex).encodeABI(),
    // data: contract.transfer.getData(toAddress, 0.01, { from: fromAddress }),
    chainId: 0x03, // 3 for ropsten
  };
  //115792089237316195423570985008687907853269984665640564039457584007913129639935
  //99999999999999999999999999999999999999999999999999999999999999999999999999999
  const tx = new ethereumjs.Tx(txObject, { chain: "ropsten" });
  tx.sign(privateKey);
  const serializedTx = tx.serialize();
  const raw = "0x" + serializedTx.toString("hex");
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log(err);
    console.log(txHash);
    alert("Transaction Sent");
    const toEtherscan = "https://ropsten.etherscan.io/tx/" + txHash;
    const time = _GetTimeSec();
    let msg =
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
    console.log(msg);
    _SendMsg("_0402_2", msg);
  });
}
