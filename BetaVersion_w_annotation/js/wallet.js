$("#_0101_button_create").click(function () {
  let pw = $("#_0101_input_password").val();
  MakeAndSaveWallet(pw);
});

$("#_0101_button_login").click(function () {
  let pw = $("#_0101_input_password").val();
  LoadWallet(pw);
});

/**
 * Make new wallet and save it to (1) web3js's local storage (2) chrome extension storage
 * @async
 * @function MakeAndSaveWallet
 * @param {string} pw - password to be set
 */
async function MakeAndSaveWallet(pw) {
  pw = await _sha256(pw);
  web3.eth.accounts.wallet.clear();
  web3.eth.accounts.wallet.create(0, "randomstring");
  await chrome.storage.sync.clear();

  if (web3.eth.accounts.wallet.save(pw)) {
    const saveinfo = _StorageStruct(pw);
    chrome.storage.sync.set(saveinfo, function () {
      GoHome();
    });
  } else {
    alert("[ERROR] Wallet not created. Please try later.");
  }
}
/**
 * Load existing wallet
 * @async
 * @function LoadWallet
 * @param  {string} pw - password of the wallet
 */
async function LoadWallet(pw) {
  pw = await _sha256(pw);
  console.log(pw);
  chrome.storage.sync.get(null, function (res) {
    console.log(res);
    if (res["walletpw"] != undefined && res["walletpw"] == pw) {
      GoHome();
    } else {
      alert("[ERROR] Invalid password.");
    }
  });
}
/**
 * sha256 for hashing password
 * @async
 * @function _sha256
 * @param  {string} message - string that should be hashed
 * @returns {string} hashed result
 */
async function _sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
