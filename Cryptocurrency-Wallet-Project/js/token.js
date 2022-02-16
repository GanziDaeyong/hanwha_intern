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
  _GetTokenFromServer();
});

$("#_0604_button_load").click(function () {
  _AutoLoad();
});

async function ValidateTokenCreateInfo(name, sym, totalsupply) {
  if (name == "" || !_isAlnum(name)) {
    alert("Token name should not be empty, nor contain special letters");
    return;
  }

  if (totalsupply <= 0.0 || !Number.isInteger(Number(totalsupply))) {
    alert("Total Supply should be positive integer");
    return;
  }

  if (name == "" || sym == "" || totalsupply <= 0.0) {
    alert(alertmsg);
    return;
  }

  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const fromBalance = await _GetBalance(fromAddress);

  // Get Expected Gas
  const gasLimit = 3000000;
  const gasPrice = 0.00000008;
  const total = gasLimit * gasPrice;

  const isBalanceEnough = parseFloat(total) <= parseFloat(fromBalance);
  if (!isBalanceEnough) {
    alert("Not enough balance");
    return;
  }

  alert("Validated");
  let msg =
    "<br><strong>Creator Address</strong><br>[" +
    fromAddress +
    "]<br><br><strong>Token Name</strong><br>[" +
    name +
    "]<br><br><strong>Token Symbol</strong><br>[" +
    sym +
    "]<br><br><strong>Total Supply</strong><br>[" +
    totalsupply +
    "]<br><br><strong>Gas Price</strong><br>[" +
    gasPrice +
    "]<br><br><strong>Gas Limit</strong><br>[" +
    gasLimit +
    "]<br><br><strong>Max Amount</strong>(can be spent at most)<br>[" +
    total +
    " ether]";
  _SendMsg("_0602_2", msg);
}

async function GetBytecodeAndDeploy() {
  Loading();

  alert(
    "Token Contract is being processed.\nThis might take upto 30 seconds.\nPlease check Log for further information."
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

  totalsupply *= 1e18;

  // Loading();

  const TokenCompileServer = "http://localhost:8080/api/v1/createtoken";
  // "http://115.85.181.243:8080/api/v1/createtoken"

  const response1 = await fetch(TokenCompileServer, {
    method: "POST",
    body: JSON.stringify({ name: name, sym: sym, totalsupply: totalsupply }),
  });
  const result1 = await response1.json();
  const bytecode = result1["bytecode"];

  UnLoading();

  _Deployer(bytecode, name, sym, totalsupply);
}

async function _Deployer(bytecode, name, sym, totalsupply) {
  // TODO: Write

  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const pw = await _GetWalletPW();
  const walletobj = web3.eth.accounts.wallet.load(pw);
  let pk = walletobj[fromAddress].privateKey;
  console.log(pk);
  pk = pk.substring(2);
  console.log(pk);

  const privateKey = Buffer.from(pk, "hex");
  const data = "0x" + bytecode;

  // let gasPrice = await _GetAvgGasPrice();
  // gasPrice = web3.utils.fromWei(gasPrice, "ether"); // toether
  // let block = await web3.eth.getBlock("latest");
  // let gasLimit = block.gasLimit / block.transactions.length;
  // gasLimit = parseInt(gasLimit) + 100000;
  // console.log(gasLimit);

  web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(3000000), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei("70", "gwei")), // 얘를 가져와서 쓰기
      // gasLimit: web3.utils.toHex(gasLimit), // Raise the gas limit to a much higher amount
      // gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "ether")),
      data: data,
    };

    const tx = new ethereumjs.Tx(txObject, { chain: "ropsten" });
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      console.log(err);
      console.log(txHash);
      const currency = name + "(" + sym + ")";
      const time = _GetTimeSec();
      const toEtherscan = "https://ropsten.etherscan.io/tx/" + txHash;

      let msg =
        "<br><strong>Transaction Hash</strong><br>[" +
        txHash +
        "]<br><br><strong>Url to Etherscan</strong><br>[" +
        toEtherscan +
        "]";
      _SendMsg("_0602_3", msg);

      const txRecord = _TxBufferStruct(
        "Token Creation",
        currency,
        txHash,
        fromAddress,
        toEtherscan,
        totalsupply * 1e-18,
        time
      );
      _TxBufferPush(txRecord);
    });
  });
}

// async function LoadToken(tokenAddress) {
//   // async function ImportToken(tokenAddress) {

//   // dyt 0x30354b1a08b628dc98d185d3d3364009206e2379
//   // aat 0x37f93c7790249901B80B9e1517Af2879e0a98458
//   // const tokenAddress = "0x37f93c7790249901B80B9e1517Af2879e0a98458";
//   const curr = await _GetCurr();
//   const fromAddress = curr["address"];
//   const isValidAddress = web3.utils.isAddress(toAddress);
//   if (!isValidAddress) {
//     alert("Invalid Token Address");
//     return;
//   }
//   let minABI = [
//     // balanceOf
//     {
//       constant: true,
//       inputs: [],
//       name: "symbol",
//       outputs: [{ name: "", type: "string" }],
//       type: "function",
//     },
//     {
//       constant: true,
//       inputs: [],
//       name: "name",
//       outputs: [{ name: "", type: "string" }],
//       type: "function",
//     },

//     {
//       constant: true,
//       inputs: [{ name: "_owner", type: "address" }],
//       name: "balanceOf",
//       outputs: [{ name: "balance", type: "uint256" }],
//       type: "function",
//     },
//     // decimals
//     {
//       constant: true,
//       inputs: [],
//       name: "decimals",
//       outputs: [{ name: "", type: "uint8" }],
//       type: "function",
//     },
//   ];

//   const contract = new web3.eth.Contract(minABI, tokenAddress);
//   const balance = await contract.methods.balanceOf(fromAddress).call();
//   const name = await contract.methods.name().call();
//   const sym = await contract.methods.symbol().call();

//   chrome.storage.sync.get(null, function (obj) {
//     const idx = obj["currAcc"];
//     const tokInfo = [name, sym, balance, tokenAddress];
//     obj["accList"][idx]["balance"].push(tokInfo);

//     chrome.storage.sync.set(obj, function () {
//       console.log(obj);
//     });
//   });
// }

async function UpdateTokenBalance(zeroforgohome) {
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
    // addList.push(eachTokInfo[3]);
    let tokenAddress = eachTokInfo[3];
    let contract = new web3.eth.Contract(minABI, tokenAddress);
    let balance = await contract.methods.balanceOf(fromAddress).call();
    tokBalList.push(balance);
  }
  console.log(tokBalList);
  chrome.storage.sync.get(null, function (obj) {
    const currIdx = obj["currAcc"];
    for (let i = 0; i < obj["accList"][currIdx]["balance"].length; i++) {
      obj["accList"][currIdx]["balance"][i][2] = tokBalList[i];
      // obj["accList"][currIdx]["balance"][i][2] = "test";
    }
    chrome.storage.sync.set(obj, function () {
      console.log(obj);
      UnLoading();
      if (zeroforgohome == 0) {
        GoHome();
      }
    });
  });
}

async function LoadToken(tokenAddress) {
  // async function ImportToken(tokenAddress) {

  // dyt 0x30354b1a08b628dc98d185d3d3364009206e2379
  // aat 0x37f93c7790249901B80B9e1517Af2879e0a98458
  //   const tokenAddress = "0x37f93c7790249901B80B9e1517Af2879e0a98458";
  Loading();
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

  const isValidAddress = web3.utils.isAddress(tokenAddress);
  if (!isValidAddress) {
    alert("Invalid Token Address");
    UnLoading();
    return;
  }

  tokenAddress = _ValidateAdd(tokenAddress);

  const tokenList = curr["balance"];
  for (let eachTokInfo of tokenList) {
    if (eachTokInfo[3] == tokenAddress) {
      alert("Token Already Imported");
      UnLoading();
      return;
    }
  }

  let minABI = [
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
    // // decimals
    // {
    //   constant: true,
    //   inputs: [],
    //   name: "decimals",
    //   outputs: [{ name: "", type: "uint8" }],
    //   type: "function",
    // },
  ];

  const contract = new web3.eth.Contract(minABI, tokenAddress);
  const balance = await contract.methods.balanceOf(fromAddress).call();
  const name = await contract.methods.name().call();
  const sym = await contract.methods.symbol().call();

  chrome.storage.sync.get(null, function (obj) {
    const idx = obj["currAcc"];
    const tokInfo = [name, sym, balance, tokenAddress];
    obj["accList"][idx]["balance"].push(tokInfo);

    chrome.storage.sync.set(obj, function () {
      console.log(obj);
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

async function _GetTokenFromServer() {
  Loading();
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

  const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
  const response = await fetch(CrawlingServerUrl);

  const result = await response.json();
  console.log(result);
  // let msg = result;
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
      if (eachTokInfo[3] == result["tokens"]["link"][i]) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) continue;
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
  // console.log(msg);
  UnLoading();
  _SendMsg("_0604", msg);
}

async function _AutoLoad() {
  Loading();
  const all = await _GetAll();
  const currIdx = all["currAcc"];
  const curr = all["accList"][currIdx];
  const fromAddress = curr["address"];

  const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
  const response = await fetch(CrawlingServerUrl);

  const tokenList = curr["balance"];

  const result = await response.json();
  chrome.storage.sync.get(null, function (obj) {
    for (let i = 0; i < result["tokens"]["name"].length; i++) {
      let isDuplicate = false;
      for (let eachTokInfo of tokenList) {
        if (eachTokInfo[3] == result["tokens"]["link"][i]) {
          isDuplicate = true;
          break;
        }
      }
      let tokInfo = [
        result["tokens"]["name"][i],
        result["tokens"]["sym"][i],
        result["tokens"]["bal"][i],
        result["tokens"]["link"][i],
      ];
      obj["accList"][currIdx]["balance"].push(tokInfo);
    }
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
      // alert("Loaded");
      UnLoading();
      GoHome();
    });
  });
}
