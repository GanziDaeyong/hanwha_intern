$("#_0201_button_account").click(function () {
  _SendMsg("_0301");
});
$("#_0301_button_create").click(function () {
  CreateAccount();
});
$("#_0301_button_load").click(function () {
  _SendMsg("_0303");
});
$("#_0303_button_enter").click(function () {
  const pk = $("#_0303_input_pk").val();
  LoadAccount(pk);
});
$("#_0301_button_transition").click(function () {
  AddOptionsForAccountTransition();
});
$("#_0304_button_enter").click(function () {
  let accIdx = $("#_0304_select_transition option:selected").val();
  AccountTransition(accIdx);
});
$("#_0301_button_detail").click(function () {
  _SendMsg("_0305");
});
$("#_0305_button_enter").click(function () {
  const pw = $("#_0305_input_pw").val();
  AccountDetail(pw);
});
$("#_0301_button_name").click(function () {
  _SendMsg("_0306");
});
$("#_0306_button_enter").click(function () {
  let name = $("#_0306_input_name").val();
  ChangeName(name);
});

/**
 * Make new account and save it to (1) web3js's local storage (2) chrome extension storage
 * @function CreateAccount
 */
function CreateAccount() {
  Loading();
  const createAccount = web3.eth.accounts.create();
  const newAccount = web3.eth.accounts.wallet.add(createAccount);
  _SaveWalletWeb3js();
  _PutStorage(newAccount, true);
  const msg =
    "<br><strong>Account Address</strong><br>[" +
    newAccount.address +
    "]<br><br>" +
    "<strong>Account Private Key</strong><br>[" +
    newAccount.privateKey +
    "]<br><br>";
  UnLoading();
  _SendMsg("_0302", msg);
}
/**
 * Load existing account
 * @async
 * @function LoadAccount
 * @param  {string} pk - input private key
 */
async function LoadAccount(pk) {
  Loading();
  pk = _ValidatePk(pk);
  if (pk == "fail") {
    alert("invalid private key");
    UnLoading();
    return;
  }
  const loadAccount = web3.eth.accounts.privateKeyToAccount(pk);
  let exist = false;
  try {
    const accs = await _GetList();
    for (let acc of accs) {
      if (acc["address"] == loadAccount.address) {
        exist = true;
      }
    }
  } catch (err) {
    // no data on storage. keep going
  }
  if (exist) {
    alert("Account Already Imported");
    UnLoading();
    return;
  }
  const newAccount = web3.eth.accounts.wallet.add(loadAccount);
  _SaveWalletWeb3js();
  _PutStorage(newAccount, false);

  const accountAddress = newAccount.address;
  let msg =
    "<br><strong>Account Address</strong><br>[" +
    accountAddress +
    "]<br><br>" +
    "<strong>Account Private Key</strong><br>[" +
    pk +
    "]";
  UnLoading();
  _SendMsg("_0303_2", msg);
}

/**
 * Change current account's name
 * @function ChangeName
 * @param  {string} name - new name
 */
function ChangeName(name) {
  if (!_isAlnum(name)) {
    alert(
      "Name should not be an empty string, and it should be in alphabet or number"
    );
    return;
  }
  chrome.storage.sync.get(null, function (obj) {
    const idx = obj["currAcc"];
    obj["accList"][idx]["name"] = name;
    chrome.storage.sync.set(obj, function () {
      alert("Name Changed");
      console.log(obj);
    });
  });
}

/**
 * Provide list of accounts (that would be chosen as current account)
 * @async
 * @function AddOptionsForAccountTransition
 */
async function AddOptionsForAccountTransition() {
  const accList = await _GetList();
  let options = "";
  for (let i = 0; i < accList.length; i++) {
    options += "<option value=" + i + ">" + accList[i]["name"] + "</option>";
  }
  _SendMsg("_0304", options);
}

/**
 * Change current account to the given index
 * @function AccountTransition
 * @param  {number} idx - index of account amongst accounts list provided by function AddOptionsForAccountTransition
 */
function AccountTransition(idx) {
  chrome.storage.sync.get(null, function (obj) {
    obj["currAcc"] = idx;
    chrome.storage.sync.set(obj, function () {
      alert("Account Transition Succeeded");
    });
  });
}

/**
 * Check current account's detail: Name, Address, Private key
 * @async
 * @function AccountDetail
 * @param  {string} pw - wallet password
 */
async function AccountDetail(pw) {
  const validity = await _CheckPw(pw);
  if (!validity) {
    alert("[ERROR] Wrong password");
    return;
  }
  const curr = await _GetCurr();
  const currAddress = curr["address"];
  const currName = curr["name"];
  const walletobj = await _GetWalletObj("checkneeded", pw);
  const currPK = walletobj[currAddress].privateKey;
  let msg =
    "<br><strong>Name</strong><br>[" +
    currName +
    "]<br><br><strong>Address</strong><br>[" +
    currAddress +
    "]<br><br><strong>Private Key</strong><br>[" +
    currPK +
    "]";

  _SendMsg("_0305_2", msg);
}
