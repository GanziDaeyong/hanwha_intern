$("#_0201_button_token").click(function () {
  _SendMsg("_0601");
});
$("#_0201_button_tokenbalance").click(function () {
  UpdateTokenBalance(0);
});
$("#_0601_button_create").click(function () {
  _SendMsg("_0602");
});
$("#_0602_button_validate").click(function () {
  const name = $("#_0602_input_name").val();
  const sym = $("#_0602_input_symbol").val();
  const totalsupply = $("#_0602_input_totalsupply").val();
  ValidateTokenCreateInfo(name, sym, totalsupply);
});
$("#_0602_2_button_confirm").click(function () {
  GetBytecodeAndDeploy();
});
$("#_0601_button_load").click(function () {
  _SendMsg("_0603");
});
$("#_0603_button_load").click(function () {
  const tokenAddress = $("#_0603_input_address").val();
  LoadToken(tokenAddress);
});
$("#_0601_button_autoload").click(function () {
  AutoLoad_Check();
});
$("#_0604_button_load").click(function () {
  AutoLoad_Execute();
});
$("#_0601_button_update").click(function () {
  UpdateTokenBalance(2);
});
/**
 * Validate token create information
 * @async
 * @function ValidateTokenCreateInfo
 * @param  {string} name - token name
 * @param  {string} sym - token symbol
 * @param  {string} totalsupply - total supply of token
 */
async function ValidateTokenCreateInfo(name, sym, totalsupply) {
  if (name == "" || !_isAlnum(name)) {
    alert(
      "[ERROR] Token name should not be empty, nor contain special letters"
    );
    return;
  }

  if (sym == "" || !_isAlnum(sym)) {
    alert(
      "[ERROR] Token symbol should not be empty, nor contain special letters"
    );
    return;
  }

  if (totalsupply <= 0.0 || isNaN(totalsupply) || totalsupply < 1e-18) {
    alert(
      "[ERROR] Total Supply should be positive number, between 1e-18 ~ 1e+18"
    );
    return;
  }

  const MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  if (totalsupply * 1e18 > MAX_INT) {
    alert(
      "[ERROR] " +
        (MAX_INT / 1e18).toLocaleString() +
        " is the greatest number available"
    );
    return;
  }

  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const fromBalance = await _GetBalance(fromAddress);

  const gasLimit = "3000000";
  const gasPrice = "0.00000008";
  const total = Number(gasLimit) * Number(gasPrice);

  const isBalanceEnough = parseFloat(total) <= parseFloat(fromBalance);
  if (!isBalanceEnough) {
    alert("ERROR] Not enough balance");
    return;
  }

  alert("Validated");
  const msg =
    "<br><strong>Creator Address</strong><br>[" +
    fromAddress +
    "]<br><br><strong>Token Name</strong><br>[" +
    name +
    "]<br><br><strong>Token Symbol</strong><br>[" +
    sym +
    "]<br><br><strong>Total Supply</strong><br>[" +
    totalsupply.toLocaleString() +
    "]<br><br><strong>Gas Price</strong><br>[" +
    gasPrice.toLocaleString() +
    "]<br><br><strong>Gas Limit</strong><br>[" +
    gasLimit +
    "]<br><br><strong>Max Amount</strong>(can be spent at most)<br>[" +
    total.toLocaleString() +
    " ether]";
  _SendMsg("_0602_2", msg);
}
/**
 * Based on validated data, get bytecode from Token Compiling Server then call deploy method
 * @async
 * @function GetBytecodeAndDeploy
 */
async function GetBytecodeAndDeploy() {
  Loading();

  alert(
    "Token Contract is being processed.\nThis might take upto 30 seconds.\nPlease do not turn off."
  );

  let text = $("#screen").text();
  text = text.split("]");
  for (let i = 0; i < text.length; i++) {
    let idx = text[i].indexOf("[");
    text[i] = text[i].substring(idx + 1);
  }

  const name = text[1];
  const sym = text[2];
  let totalsupply = text[3];
  totalsupply *= 1e18; // Need to be converted, as Solidity contract's default is 18 decimal

  let totalsupplyFixed = totalsupply.toLocaleString();
  totalsupplyFixed = totalsupplyFixed.replaceAll(",", "");

  // const TokenCompileServer = "http://localhost:8080/api/v1/createtoken";
  const TokenCompileServer = "http://115.85.181.243:8080/api/v1/createtoken";

  try {
    const response = await fetch(TokenCompileServer, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        sym: sym,
        totalsupply: totalsupplyFixed,
      }),
    });
    const result = await response.json();
    const bytecode = result["bytecode"];
    if (bytecode == "") {
      alert(
        "[ERROR] Unknown error occurred during contract compilation. Please try again. If you keep watching this error, please contact us via email on 'contact us' page."
      );
      UnLoading();
      return;
    }
    _Deployer(bytecode, name, sym, totalsupplyFixed);
  } catch (err) {
    alert(
      "[ERROR] Something went wrong with token compiling server. If you are repetitively watching this message, please contact us via email on 'contact us' page."
    );
    UnLoading();
    return;
  }
}
/**
 * Deploy token contract. Have same logic with sending transaction
 * @async
 * @function _Deployer
 * @param  {string} bytecode - bytecode from token compiling server
 * @param  {string} name - token name
 * @param  {string} sym - token symbol
 * @param  {number} totalsupply - total supply of token
 */
async function _Deployer(bytecode, name, sym, totalsupply) {
  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const pw = await _GetWalletPW();

  const walletobj = await _GetWalletObj("correct", pw);
  let pk = walletobj[fromAddress].privateKey;
  pk = pk.substring(2);

  const privateKey = Buffer.from(pk, "hex");
  const data = "0x" + bytecode;

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
      gasLimit: web3.utils.toHex(3000000),
      gasPrice: web3.utils.toHex(web3.utils.toWei("70", "gwei")),
      data: data,
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

      const currency = name + "(" + sym + ")";
      const time = _GetTimeSec();
      const toEtherscan = "https://ropsten.etherscan.io/tx/" + txHash;

      let msg =
        "<br><strong>Transaction Hash</strong><br>[" +
        txHash +
        ']<br><br><strong>URL to Etherscan</strong><br><a href="' +
        toEtherscan +
        '" target="_blank">click!</a><br>';

      totalsupply = Number(totalsupply) / 1e18;
      totalsupply = totalsupply.toLocaleString().replaceAll(",", "");
      const txRecord = _TxBufferStruct(
        "Token Creation",
        currency,
        txHash,
        fromAddress,
        toEtherscan,
        totalsupply,
        time
      );
      UnLoading();
      _TxBufferPush(txRecord);
      _SendMsg("_0602_3", msg);
    });
  });
}
/**
 * Update all the token balance.
 * @async
 * @function UpdateTokenBalance
 * @param  {number} zeroforgohometwoforalert - after updating, whether to go home or make alert or do nothing
 */
async function UpdateTokenBalance(zeroforgohometwoforalert) {
  Loading();
  const minABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
  ];

  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  let tokBalList = [];
  for (let eachTokInfo of curr["balance"]) {
    let tokenAddress = eachTokInfo[3];
    let contract = new web3.eth.Contract(minABI, tokenAddress);
    let balance = await contract.methods.balanceOf(fromAddress).call();
    balance /= 1e18; // to ether decimal
    tokBalList.push(balance);
  }
  chrome.storage.sync.get(null, function (obj) {
    const currIdx = obj["currAcc"];
    for (let i = 0; i < obj["accList"][currIdx]["balance"].length; i++) {
      obj["accList"][currIdx]["balance"][i][2] = tokBalList[i];
    }
    chrome.storage.sync.set(obj, function () {
      UnLoading();
      if (zeroforgohometwoforalert == 0) {
        GoHome();
      }
      if (zeroforgohometwoforalert == 2) {
        alert("Token Balances Updated");
        GoHome();
      }
    });
  });
}
/**
 * Load single token to current account.
 * @async
 * @function LoadToken
 * @param  {string} tokenAddress - token address to load
 */
async function LoadToken(tokenAddress) {
  Loading();
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

  const isValidAddress = web3.utils.isAddress(tokenAddress);
  if (!isValidAddress) {
    alert("[Error] Invalid Token Address");
    UnLoading();
    return;
  }

  tokenAddress = _ValidateAdd(tokenAddress);

  const tokenList = curr["balance"];
  for (let eachTokInfo of tokenList) {
    if (eachTokInfo[3] == tokenAddress) {
      alert("[Error] Token Already Imported");
      UnLoading();
      return;
    }
  }

  const minABI = [
    // balanceOf
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [{ name: "", type: "string" }],
      type: "function",
    },

    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
  ];

  let balance, name, sym;
  try {
    const contract = new web3.eth.Contract(minABI, tokenAddress);
    balance = await contract.methods.balanceOf(fromAddress).call();
    balance /= 1e18;
    name = await contract.methods.name().call();
    sym = await contract.methods.symbol().call();
  } catch (err) {
    alert("[ERROR] Invalid Token Address. Check address.");
    UnLoading();
    return;
  }

  chrome.storage.sync.get(null, function (obj) {
    const idx = obj["currAcc"];
    const tokInfo = [name, sym, balance, tokenAddress];
    obj["accList"][idx]["balance"].push(tokInfo);

    chrome.storage.sync.set(obj, function () {
      const msg =
        "<br><strong>Token Address</strong><br>[" +
        tokenAddress +
        "]<br><br><strong>Token Name</strong><br>[" +
        name +
        "]<br><br><strong>Token Symbol</strong><br>[" +
        sym +
        "]<br><br><strong>Token Balance</strong><br>[" +
        balance +
        "]";
      UnLoading();
      _SendMsg("_0603_2", msg);
    });
  });
}
/**
 * Check if user will load all the tokens that belong to the account
 * @async
 * @function AutoLoad_Check
 */
async function AutoLoad_Check() {
  Loading();
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

  // const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
  const CrawlingServerUrl =
    "http://115.85.181.243:3000/api/address/" + fromAddress;
  const response = await fetch(CrawlingServerUrl);

  const result = await response.json();
  let msg = "";

  const tokLen = result["tokens"]["name"].length;
  if (tokLen == 0) {
    alert("Current account doesn't possess any token");
    UnLoading();
    _SendMsg("_0601", msg);
    return;
  }

  const tokenList = curr["balance"];

  for (let i = 0; i < result["tokens"]["name"].length; i++) {
    let isDuplicate = false;
    for (let eachTokInfo of tokenList) {
      const toLow = eachTokInfo[3].toLowerCase();
      if (
        eachTokInfo[3] == result["tokens"]["link"][i] ||
        toLow == result["tokens"]["link"][i]
      ) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) {
      console.log(result["tokens"]["name"][i] + "Should be skipped");
      continue;
    }
    const comb =
      "<br>" +
      result["tokens"]["name"][i] +
      " (" +
      result["tokens"]["sym"][i] +
      ") : " +
      result["tokens"]["bal"][i];
    msg += comb;
  }

  if (msg.trim() == "") {
    alert("All tokens are already imported");
    UnLoading();
    _SendMsg("_0601", msg);
    return;
  }
  msg += "<br><br>will be loaded to your account";
  UnLoading();
  _SendMsg("_0604", msg);
}
/**
 * Load all the tokens, except for the ones already imported. Basically works same as AutoLoad_Check()
 * @async
 * @function AutoLoad_Execute
 */
async function AutoLoad_Execute() {
  Loading();
  const all = await _GetAll();
  const currIdx = all["currAcc"];
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

  // const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
  const CrawlingServerUrl =
    "http://115.85.181.243:3000/api/address/" + fromAddress;
  const response = await fetch(CrawlingServerUrl);

  const tokenList = curr["balance"];

  const result = await response.json();
  chrome.storage.sync.get(null, function (obj) {
    for (let i = 0; i < result["tokens"]["name"].length; i++) {
      let isDuplicate = false;
      for (let eachTokInfo of tokenList) {
        const toLow = eachTokInfo[3].toLowerCase();
        if (
          eachTokInfo[3] == result["tokens"]["link"][i] ||
          toLow == result["tokens"]["link"][i]
        ) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;
      let tokInfo = [
        result["tokens"]["name"][i],
        result["tokens"]["sym"][i],
        result["tokens"]["bal"][i],
        result["tokens"]["link"][i],
      ];
      obj["accList"][currIdx]["balance"].push(tokInfo);
    }
    chrome.storage.sync.set(obj, function () {
      UnLoading();
      GoHome();
    });
  });
}
