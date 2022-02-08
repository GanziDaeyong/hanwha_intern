$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  // UpdateTokenBalance();
  // LoadToken();
  // _GetTokenBalance();
});

$("#_0201_button_tokenbalance").click(function () {
  UpdateTokenBalance();
});

// $("#_0601_button_create").click(function () {
//   _SendMsg("_0602");
// });

// $("#_0602_button_create").click(function () {
//   const name = $("#_0602_input_name").val();
//   const sym = $("#_0602_input_symbol").val();
//   let totalsupply = $("#_0602_input_totalsupply").val();
//   totalsupply *= 1e18;
//   GetBytecodeAndDeploy(name, sym, totalsupply);
// });

// async function GetBytecodeAndDeploy(name, sym, totalsupply) {
//   alert(
//     "Token Contract is being processed.\nThis might take upto 3 minutes.\nPlease check Log for further information."
//   );

//   const l = "http://localhost:8080/api/v1/createtoken";

//   const response1 = await fetch(
//     // "http://115.85.181.243:8080/api/v1/createtoken"
//     l,
//     {
//       method: "POST",
//       body: JSON.stringify({ name: name, sym: sym, totalsupply: totalsupply }),
//     }
//   );
//   const result1 = await response1.json();
//   const bytecode = result1["bytecode"];
//   console.log(result1);
//   _Deployer(bytecode, name, sym, totalsupply);
// }

// async function _Deployer(bytecode, name, sym, totalsupply) {
//   // TODO: Write

//   const curr = await _GetCurr();
//   const fromAddress = curr["address"];
//   const pw = await _GetWalletPW();
//   const walletobj = web3.eth.accounts.wallet.load(pw);
//   let pk = walletobj[fromAddress].privateKey;
//   console.log(pk);
//   pk = pk.substring(2);
//   console.log(pk);

//   const privateKey = Buffer.from(pk, "hex");
//   const data = "0x" + bytecode;

//   // let gasPrice = await _GetAvgGasPrice();
//   // gasPrice = web3.utils.fromWei(gasPrice, "ether"); // toether
//   // let block = await web3.eth.getBlock("latest");
//   // let gasLimit = block.gasLimit / block.transactions.length;
//   // gasLimit = parseInt(gasLimit) + 100000;
//   // console.log(gasLimit);

//   web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
//     const txObject = {
//       nonce: web3.utils.toHex(txCount),
//       gasLimit: web3.utils.toHex(2000000), // Raise the gas limit to a much higher amount
//       gasPrice: web3.utils.toHex(web3.utils.toWei("80", "gwei")), // 얘를 가져와서 쓰기
//       // gasLimit: web3.utils.toHex(gasLimit), // Raise the gas limit to a much higher amount
//       // gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "ether")),
//       data: data,
//     };

//     const tx = new ethereumjs.Tx(txObject, { chain: "ropsten" });
//     tx.sign(privateKey);
//     const serializedTx = tx.serialize();
//     const raw = "0x" + serializedTx.toString("hex");

//     web3.eth.sendSignedTransaction(raw, (err, txHash) => {
//       console.log(err);
//       console.log(txHash);
//       const currency = name + "(" + sym + ")";
//       const time = _GetTimeSec();
//       const txRecord = _TxBufferStruct(
//         "Token Creation",
//         currency,
//         txHash,
//         fromAddress,
//         "null",
//         totalsupply * 1e-18,
//         time
//       );
//       _TxBufferPush(txRecord);
//     });
//   });
// }

async function sendTok(toAddress, tokenAddress, amount) {
  const curr = await _GetCurr();
  const fromAddress = curr["address"];
  // const toAddress = "0x5CCE38322F190EAB8Abc7Ceb23E816Cf7d3b48DC";

  const pw = await _GetWalletPW();
  const walletobj = web3.eth.accounts.wallet.load(pw);
  let pk = walletobj[fromAddress].privateKey;
  pk = pk.substring(2);
  console.log(pk);

  const privateKey = Buffer.from(pk, "hex");

  const abiArray = abi;
  // const contractAddress = "0x71b217e399E3f2ac330a994D3bD68AE9731a7aF2";
  const contract = new web3.eth.Contract(abiArray, contractAddress, {
    from: fromAddress,
  });
  const count = await web3.eth.getTransactionCount(fromAddress);

  const gasLimit = web3.utils.toHex(100000); // Raise the gas limit to a much higher amount
  const gasPrice = web3.utils.toHex(web3.utils.toWei("50", "gwei")); // 얘를 가져와서 쓰기
  // TODO:

  const txObject = {
    from: fromAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: contractAddress,
    value: "0x0",
    data: contract.methods.transfer(toAddress, amount).encodeABI(),
    // data: contract.transfer.getData(toAddress, 0.01, { from: fromAddress }),
    chainId: 0x03, // 3 for ropsten
  };

  const tx = new ethereumjs.Tx(txObject, { chain: "ropsten" });
  tx.sign(privateKey);
  const serializedTx = tx.serialize();
  const raw = "0x" + serializedTx.toString("hex");
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log(err);
    console.log(txHash);
  });
}

/* get token balance */
// async function LoadToken() {
//   // async function ImportToken(tokenAddress) {

//   // dyt 0x30354b1a08b628dc98d185d3d3364009206e2379
//   // aat 0x37f93c7790249901B80B9e1517Af2879e0a98458
//   const tokenAddress = "0x37f93c7790249901B80B9e1517Af2879e0a98458";
//   const curr = await _GetCurr();
//   const fromAddress = curr["address"];

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

// async function UpdateTokenBalance() {
//   const minABI = [
//     // balanceOf
//     {
//       constant: true,
//       inputs: [{ name: "_owner", type: "address" }],
//       name: "balanceOf",
//       outputs: [{ name: "balance", type: "uint256" }],
//       type: "function",
//     },
//   ];

//   const curr = await _GetCurr();
//   const fromAddress = curr["address"];
//   let tokBalList = [];
//   for (let eachTokInfo of curr["balance"]) {
//     // addList.push(eachTokInfo[3]);
//     let tokenAddress = eachTokInfo[3];
//     let contract = new web3.eth.Contract(minABI, tokenAddress);
//     let balance = await contract.methods.balanceOf(fromAddress).call();
//     tokBalList.push(balance);
//   }
//   console.log(tokBalList);
//   chrome.storage.sync.get(null, function (obj) {
//     const currIdx = obj["currAcc"];
//     for (let i = 0; i < obj["accList"][currIdx]["balance"].length; i++) {
//       obj["accList"][currIdx]["balance"][i][2] = tokBalList[i];
//       // obj["accList"][currIdx]["balance"][i][2] = "test";
//     }
//     chrome.storage.sync.set(obj, function () {
//       console.log(obj);
//       GoHome();
//     });
//   });
// }
