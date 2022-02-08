$("#_0201_button_token").click(function () {
  _SendMsg("_0601");
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

async function ValidateTokenCreateInfo(name, sym, totalsupply) {
  if (name == "" || sym == "" || totalsupply <= 0.0) {
    const alertmsg =
      "Name should not be empty\nSymbol should not be empty\nTotal Supply should be positive value";

    alert(alertmsg);
    return;
  }

  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  const fromBalance = await _GetBalance(fromAddress);

  // Get Expected Gas
  const gasLimit = 3000000; // Raise the gas limit to a much higher amount
  const gasPrice = 0.00000008; // 얘를 가져와서 쓰기
  const total = gasLimit * gasPrice;

  const isBalanceEnough = parseFloat(total) <= parseFloat(fromBalance);
  if (!isBalanceEnough) {
    alert("Not enough balance");
    return;
  }

  alert("Validated");
  let msg =
    "creator address[" +
    fromAddress +
    "]\n\ntoken full name[" +
    name +
    "]\n\ntoken symbol[" +
    sym +
    "]\n\ntotal supply[" +
    totalsupply +
    "]\n\ngas price[" +
    gasPrice +
    "]\n\ngas limit[" +
    gasLimit +
    "]\n\nmax amount(can be spent at most)[" +
    total +
    "]\n";
  _SendMsg("_0602_2", msg);
}

async function GetBytecodeAndDeploy() {
  alert(
    "Token Contract is being processed.\nThis might take upto 3 minutes.\nPlease check Log for further information."
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

  const TokenCompileServer = "http://localhost:8080/api/v1/createtoken";
  // "http://115.85.181.243:8080/api/v1/createtoken"

  const response1 = await fetch(TokenCompileServer, {
    method: "POST",
    body: JSON.stringify({ name: name, sym: sym, totalsupply: totalsupply }),
  });
  const result1 = await response1.json();
  const bytecode = result1["bytecode"];
  console.log(result1);
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
        "transaction hash\n[" +
        txHash +
        "]\n\nurl to etherscan\n[" +
        toEtherscan +
        "]";
      _SendMsg("_0602_3", msg);

      const txRecord = _TxBufferStruct(
        "Token Creation",
        currency,
        txHash,
        fromAddress,
        "null",
        totalsupply * 1e-18,
        time
      );
      _TxBufferPush(txRecord);
    });
  });
}

async function LoadToken() {
  // async function ImportToken(tokenAddress) {

  // dyt 0x30354b1a08b628dc98d185d3d3364009206e2379
  // aat 0x37f93c7790249901B80B9e1517Af2879e0a98458
  const tokenAddress = "0x37f93c7790249901B80B9e1517Af2879e0a98458";
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

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
    // decimals
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      type: "function",
    },
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
    });
  });
}

async function UpdateTokenBalance() {
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
      GoHome();
    });
  });
}

async function LoadToken(tokenAddress) {
  // async function ImportToken(tokenAddress) {

  // dyt 0x30354b1a08b628dc98d185d3d3364009206e2379
  // aat 0x37f93c7790249901B80B9e1517Af2879e0a98458
  //   const tokenAddress = "0x37f93c7790249901B80B9e1517Af2879e0a98458";
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

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
    // decimals
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      type: "function",
    },
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
    });
  });
}
