$("#_home").click(function () {
  GoHome();
});

$("#contact").click(function () {
  _SendMsg("dev");
});

/**
 * Go to home page
 * @async
 * @function GoHome
 */
async function GoHome() {
  try {
    Loading();
    const curr = await _GetCurr();
    const address = curr["address"];
    const name = curr["name"];
    CheckTxBuffer();

    _GetBalance_EtherAndToken(curr).then((result) => {
      let msg =
        "<br><strong>Current Account:</strong><br>" +
        name +
        "<br><br><strong>Account Address:</strong><br>" +
        address +
        "<br><br><strong>Account Balance:</strong><br>" +
        result;
      UnLoading();

      _SendMsg("_0201", msg);
    });
  } catch (err) {
    console.log(err);
    UnLoading();
    _SendMsg("_0201_2");
  }
}

/**
 * Get current account's ether and token balances
 * @async
 * @function _GetBalance_EtherAndToken
 * @param  {object} currObj - current account's object
 * @returns {string} current account's balance information in string
 */
async function _GetBalance_EtherAndToken(currObj) {
  const accountAddress = currObj["address"];
  const tokList = currObj["balance"];

  let res = "";
  const getbalance = await web3.eth.getBalance(accountAddress);
  const ethBal = String(web3.utils.fromWei(getbalance, "ether"));
  res += "eth: " + ethBal + "<br>";

  for (let eachTokList of tokList) {
    const linkToEtherscan =
      "https://ropsten.etherscan.io/token/" + eachTokList[3];
    const a = '<br><a href="' + linkToEtherscan + '" target="_blank">';
    const b = eachTokList[0] + "(" + eachTokList[1] + "): " + eachTokList[2];
    const c = "</a>";
    res += a + b + c;
  }
  res +=
    "<br>* For the actual balance of each token, please visit Etherscan with provided link";
  return res;
}
