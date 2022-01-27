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

// obj.address
// obj.privateKey

// let struct = {
//   currAcc: oneAcc,
//   accList: accList,
//   walletpw: walletPassword,
//   tnm: tokenNameMapper,
//   txbuf: transactionBuffer,
// };
