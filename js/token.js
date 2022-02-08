async function GetBytecodeAndDeploy(name, sym, totalsupply) {
  alert(
    "Token Contract is being processed.\nThis might take upto 3 minutes.\nPlease check Log for further information."
  );

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
      const currency = name + "(" + sym + ")";
      const time = _GetTimeSec();
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
