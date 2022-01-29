$("#_0201_button_account").click(function () {
  console.log("CLICKED");
  _SendMsg("_0301");
});

$("#_0301_button_create").click(function () {
  let screenMsg = CreateAccount();
  alert(screenMsg);
  _SendMsg("_0302", screenMsg);
});

$("#_0301_button_load").click(function () {
  // _PutStorage(); // test
  _SendMsg("_0303");
});
$("#_0303_button_enter").click(function () {
  let pk = $("#_0303_input_pk").val();
  let screenMsg = LoadAccount(pk);
  _SendMsg("_0303_2", screenMsg);
});

$("#_0301_button_name").click(function(){
  _SendMsg("_0306");
})

$("#_0306_button_enter").click(function(){
  let name = $("#_0306_input_name").val();
  ChangeName(name);
})

function CreateAccount() {
  let newAccount = web3.eth.accounts.create();
  _PutStorage(newAccount, true); // to Curr
  console.log("aa");
  let msg =
    "Account Created\n\n" +
    "Account Address: [" +
    newAccount.address +
    "]\n\n" +
    "Account Private Key: [" +
    newAccount.privateKey +
    "]\n\n";

  return msg;
}

function LoadAccount(pk) {
  let newAccount = web3.eth.accounts.privateKeyToAccount(pk);
  let accountAddress = newAccount.address;
  _PutStorage(newAccount, false); // to Curr

  let msg =
    "Account Loaded\n\n" +
    "Account Address: [" +
    accountAddress +
    "]\n\n" +
    "Account Private Key: [" +
    pk +
    "]\n\n";

  return msg;
}

function ChangeName(name) {
  chrome.storage.sync.get(null, function (obj) {
    obj["currAcc"]["name"] = name;
    chrome.storage.sync.set(obj, function () {
      alert("Name Changed");
    });
  });
}
