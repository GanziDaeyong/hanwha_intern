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

$("#_0301_button_transition").click(function () {
  AddOptions();
});

$("#_0304_button_enter").click(function () {
  let accIdx = $("#_0304_select_transition option:selected").val();
  AccountTransition(accIdx);
  alert("Account Transition Succeeded");
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

function CreateAccount() {
  let createAccount = web3.eth.accounts.create(); // account obj
  let newAccount = web3.eth.accounts.wallet.add(createAccount);
  _SaveWalletWeb3js();
  _PutStorage(newAccount, true); // to Curr
  // console.log("aa");
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
  let loadAccount = web3.eth.accounts.privateKeyToAccount(pk); // account obj
  let newAccount = web3.eth.accounts.wallet.add(loadAccount);
  _SaveWalletWeb3js();
  let accountAddress = newAccount.address;
  // TODO: 이미 지갑에 있는 계정이라면 invalid하게
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
    const idx = obj["currAcc"];
    obj["accList"][idx]["name"] = name;

    chrome.storage.sync.set(obj, function () {
      alert("Name Changed");
      console.log(obj);
    });
  });
}

async function AddOptions() {
  let accList = await _GetList();
  let options = "";
  for (let i = 0; i < accList.length; i++) {
    options += "<option value=" + i + ">" + accList[i]["name"] + "</option>";
    // $("#_0304_select_transition").append(selectOptions);
    // https://24hours-beginner.tistory.com/98
  }
  console.log(options);
  _SendMsg("_0304", options);
}

function AccountTransition(idx) {
  chrome.storage.sync.get(null, function (obj) {
    obj["currAcc"] = idx;
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
    });
  });
}

// TODO: Login Validtion -> modulify
function AccountDetail(pw) {
  chrome.storage.sync.get(null, function (obj) {
    if (obj["walletpw"] == pw) {
      let walletobj = web3.eth.accounts.wallet.load(pw);
      console.log(walletobj);
      let currIdx = obj["currAcc"];
      let currAddress = obj["accList"][currIdx]["address"];
      let currName = obj["accList"][currIdx]["name"];
      let currPK = walletobj[currAddress].privateKey;
      let msg =
        "Name\n[" +
        currName +
        "]\n\nAddress\n[" +
        currAddress +
        "]\n\nPrivate Key\n[" +
        currPK +
        "]";

      _SendMsg("_0305_2", msg);
    } else {
      alert("invalid password");
    }
  });
}
