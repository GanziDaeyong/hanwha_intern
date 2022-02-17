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
  let pk = $("#_0303_input_pk").val();
  LoadAccount(pk);
});

$("#_0301_button_transition").click(function () {
  AddOptions();
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

function CreateAccount() {
  console.log("start");
  let createAccount = web3.eth.accounts.create();
  let newAccount = web3.eth.accounts.wallet.add(createAccount);
  console.log("created and added");

  _SaveWalletWeb3js();
  console.log("saved to wallet");

  _PutStorage(newAccount, true); // to Curr
  console.log("saved to storage");

  // console.log("aa");
  let msg =
    "<br><strong>Account Address</strong><br>[" +
    newAccount.address +
    "]<br><br>" +
    "<strong>Account Private Key</strong><br>[" +
    newAccount.privateKey +
    "]<br><br>";
  _SendMsg("_0302", msg);
}

function _ValidateAdd(address) {
  if (address.length == 42) {
    if (address[0] == "0" && address[1] == "x") {
      if (_isAlnum(address)) {
        return address;
      }
    }
  }
  if (address.length == 40) {
    if (address[0] != "0" && address[1] != "x") {
      if (_isAlnum(address)) {
        return "0x" + address;
      }
    }
  }
  return "fail";
}

function _ValidatePk(pk) {
  console.log(pk.length);
  if (pk.length == 66) {
    if (pk[0] == "0" && pk[1] == "x") {
      if (_isAlnum(pk)) {
        return pk;
      }
    }
  }
  if (pk.length == 64) {
    if (pk[0] != "0" && pk[1] != "x") {
      console.log("camehere");
      if (_isAlnum(pk)) {
        return "0x" + pk;
      }
    }
  }

  return "fail";
}

function _isAlnum(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // if (code == )
      return false;
    }
  }
  return true;
}

// function _isNum(str) {
//   var code, i, len;

//   for (i = 0, len = str.length; i < len; i++) {
//     code = str.charCodeAt(i);
//     if (!(code > 47 && code < 58)) {
//       return false;
//     }
//   }
//   return true;
// }

async function LoadAccount(pk) {
  pk = _ValidatePk(pk);
  if (pk == "fail") {
    alert("invalid private key");
    return;
  }

  // TODO: 예외처리 / pk의 validity 확인필요하다.
  let loadAccount = web3.eth.accounts.privateKeyToAccount(pk); // account obj
  console.log(loadAccount.address);
  let exist = false;
  try {
    accs = await _GetList();
    console.log(accs);
    for (const acc of accs) {
      if (acc["address"] == loadAccount.address) {
        exist = true;
      }
    }
  } catch (err) {
    console.log(err);
  }
  if (exist) {
    alert("Account Already Imported");
    return;
  }

  let newAccount = web3.eth.accounts.wallet.add(loadAccount);

  _SaveWalletWeb3js();

  let accountAddress = newAccount.address;
  // TODO: 이미 지갑에 있는 계정이라면 invalid하게
  _PutStorage(newAccount, false); // to Curr

  let msg =
    "<br><strong>Account Address</strong><br>[" +
    accountAddress +
    "]<br><br>" +
    "<strong>Account Private Key</strong><br>[" +
    pk +
    "]";

  UnLoading();

  _SendMsg("_0303_2", msg);

  return msg;
}

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

async function AddOptions() {
  let accList = await _GetList();

  let options = "";
  for (let i = 0; i < accList.length; i++) {
    options += "<option value=" + i + ">" + accList[i]["name"] + "</option>";
  }
  console.log(options);
  _SendMsg("_0304", options);
}

function AccountTransition(idx) {
  chrome.storage.sync.get(null, function (obj) {
    obj["currAcc"] = idx;
    chrome.storage.sync.set(obj, function () {
      alert("Account Transition Succeeded");
    });
  });
}

// TODO: Login Validtion -> modulify
async function AccountDetail(pw) {
  pw = await sha256(pw);
  chrome.storage.sync.get(null, function (obj) {
    if (obj["walletpw"] == pw) {
      let walletobj = web3.eth.accounts.wallet.load(pw);
      console.log(walletobj);
      let currIdx = obj["currAcc"];
      let currAddress = obj["accList"][currIdx]["address"];
      let currName = obj["accList"][currIdx]["name"];
      let currPK = walletobj[currAddress].privateKey;
      let msg =
        "<br><strong>Name</strong><br>[" +
        currName +
        "]<br><br><strong>Address</strong><br>[" +
        currAddress +
        "]<br><br><strong>Private Key</strong><br>[" +
        currPK +
        "]";

      _SendMsg("_0305_2", msg);
    } else {
      alert("invalid password");
    }
  });
}
