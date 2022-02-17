$("#_0101_button_create").click(function () {
  let pw = $("#_0101_input_password").val();
  MakeAndSaveWallet(pw);
});

$("#_0101_button_login").click(function () {
  let pw = $("#_0101_input_password").val();
  LoadWallet(pw);
});


/** 
 * @async
 * @function MakeAndSaveWallet
 * @param {string} input password
 */
async function MakeAndSaveWallet(pw) {
  pw = await sha256(pw);
  console.log("->" + pw);
  web3.eth.accounts.wallet.clear();
  web3.eth.accounts.wallet.create(0, "randomstring");
  // await chrome.storage.sync.clear(function () {});
  await chrome.storage.sync.clear();

  // web3.eth.accounts.wallet.save(pw);
  if (web3.eth.accounts.wallet.save(pw)) {
    console.log("wallet created & saved");
    //save at extension storage
    let saveinfo = _StorageStruct(pw);
    chrome.storage.sync.set(saveinfo, function () {
      console.log("wallet saved on extension");
    });
    // _SendMsg("_0201");
    GoHome();
  } else {
    console.log("wallet not created");
  }
}

async function LoadWallet(pw) {
  pw = await sha256(pw);
  console.log(pw);
  chrome.storage.sync.get(null, function (res) {
    console.log(res);
    if (res["walletpw"] != undefined && res["walletpw"] == pw) {
      console.log("[INFO] Login Succeeded");
      // _SendMsg("_0201");
      GoHome();
    } else {
      alert("invalid password");
    }
  });
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
