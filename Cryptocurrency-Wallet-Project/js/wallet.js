/*
	wallet.js

	지갑 관련 로직을 담당한다.
*/

// Login - Create wallet with password
$("#_0101_button_create").click(function () {
  let pw = $("#_0101_input_password").val();
  MakeAndSaveWallet(pw);
});

// Login - Log in with password
$("#_0101_button_login").click(function () {
  let pw = $("#_0101_input_password").val();
  LoadWallet(pw);
});

function MakeAndSaveWallet(pw) {
  console.log("->" + pw);
  web3.eth.accounts.wallet.clear();
  web3.eth.accounts.wallet.create(0, "randomstring");
  // web3.eth.accounts.wallet.save(pw);
  if (web3.eth.accounts.wallet.save(pw)) {
    console.log("wallet created & saved");
    _SendMsg("_0201");
  } else {
    console.log("wallet not created");
  }
  chrome.storage.sync.clear(function () {});
  //save at extension storage
  let saveinfo = _StorageStruct(pw);
  chrome.storage.sync.set(saveinfo, function () {
    console.log("wallet saved on extension");
  });
}

function LoadWallet(pw) {
  chrome.storage.sync.get(null, function (res) {
    if (res["walletpw"] != undefined && res["walletpw"] == pw) {
      console.log("[INFO] Login Succeeded");
      // _SendMsg("_0201");
      GoHome();
    } else {
      alert("invalid password");
      console.log("[INFO] Login Failed. Wrong PW");
    }
  });
}
