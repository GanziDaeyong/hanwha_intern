$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  console.log("gogo");
  // f_deploy_sc();
  // GetBytecode("sooong", "sgt", 3000000000000);
  // tokbal();
  sendTok();
  // _SendMsg("_0601");
});

$("#_0601_button_create").click(function () {
  _SendMsg("_0602");
});

async function GetBytecode(name, sym, totalsupply) {
  const l = "http://localhost:8080/api/v1/createtoken";

  const response1 = await fetch(
    // "http://115.85.181.243:8080/api/v1/createtoken"
    l,
    {
      method: "POST",
      body: JSON.stringify({ name: name, sym: sym, totalsupply: totalsupply }),
    }
  );
  const result1 = await response1.json();
  const bytecode = result1["bytecode"];
  console.log(result1);
  // let bytecode = ; // test
  const t = f_deploy_sc(bytecode);
}

async function f_deploy_sc(bytecode) {
  // TODO: Write
  console.log("Begin deployment");

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

  console.log("Begin deployment2");

  // let gasPrice = await _GetAvgGasPrice();
  // gasPrice = web3.utils.fromWei(gasPrice, "ether"); // toether
  // let block = await web3.eth.getBlock("latest");
  // let gasLimit = block.gasLimit / block.transactions.length;
  // gasLimit = parseInt(gasLimit) + 100000;
  // console.log(gasLimit);
  console.log("Begin deployment3");

  web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(2000000), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei("80", "gwei")), // 얘를 가져와서 쓰기
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
    });
  });
}

function sendTok() {
  // let abi = require("human-standard-token-abi");
  // console.log(abi);

  console.log(abi);
}

// send token
/*

var count = web3.eth.getTransactionCount("0x26...");
var abiArray = JSON.parse(fs.readFileSync('mycoin.json', 'utf-8'));
var contractAddress = "0x8...";
var contract = web3.eth.contract(abiArray).at(contractAddress);
var rawTransaction = {
    "from": "0x26...",
    "nonce": web3.toHex(count),
    "gasPrice": "0x04e3b29200",
    "gasLimit": "0x7458",
    "to": contractAddress,
    "value": "0x0",
    "data": contract.transfer.getData("0xCb...", 10, {from: "0x26..."}),
    "chainId": 0x03
};

var privKey = new Buffer('fc3...', 'hex');
var tx = new Tx(rawTransaction);

tx.sign(privKey);
var serializedTx = tx.serialize();

web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
    if (!err)
        console.log(hash);
    else
        console.log(err);
});
*/

/* get token balance */
async function tokbal() {
  let dec = 1e-18;
  let tokenAddress = "0x5bD82754D73e98139d0356F3607b377402E747a7";
  // let walletAddress = "0xa7c1b07c893ca1934bb4f5730a3008503e804f5d";
  let walletAddress = "0x5CCE38322F190EAB8Abc7Ceb23E816Cf7d3b48DC";
  // The minimum ABI to get ERC20 Token balance
  let minABI = [
    // balanceOf
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

  let contract = new web3.eth.Contract(minABI, tokenAddress);
  let balance = await contract.methods.balanceOf(walletAddress).call();
  balance = parseInt(balance) * dec;
  console.log(balance);
}
