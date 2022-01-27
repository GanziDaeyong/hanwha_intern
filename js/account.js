$("#_0201_button_account").click(function () {
  console.log("CLICKED");
  SendMsg("_0301");
});

$("#_0301_button_create").click(function () {
  let screenMsg = CreateAccount();
  alert(screenMsg);
  SendMsg("_0302", screenMsg);
});

$("#_0301_button_load").click(function () {
  // _PutStorage(); // test

  SendMsg("_0303");
});

$("#_0303_button_enter").click(function () {
  let pk = $("#_0303_input_pk").val();
  let screenMsg = LoadAccount(pk);
  SendMsg("_0303_2", screenMsg);
});

$("#_home").click(function () {
  SendMsg("_0201");
});

function CreateAccount() {
  let account = web3.eth.accounts.create();

  let msg =
    "Account Created\n\n" +
    "Account Address: [" +
    account.address +
    "]\n\n" +
    "Account Private Key: [" +
    account.privateKey +
    "]\n\n";

  return msg;
}

function LoadAccount(pk) {
  let newAccount = web3.eth.accounts.privateKeyToAccount(pk);
  let accountAddress = newAccount.address;
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

function _PutStorage(accountObj) {
  chrome.storage.sync.get(null, function (res) {
    // TODO : pw should be hashed
    console.log(res);
  });

  // name: "default",
  // balance: {
  //   eth: 0,
  // },
  // history: {
  //   type: "default",
  //   amount: 0,
  //   receiver: "default",
  // },
}
