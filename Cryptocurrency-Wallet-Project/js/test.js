$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});
// $("#_0601_button_autoload").click(function () {
$("#test").click(function () {
  _GetTokenFromServer();
  // t();
});

$("#_0604_button_load").click(function () {
  // let res = $("#_0604_select_token").val();
  // console.log(res);
  // t();
  _AutoLoad();
});

async function _GetTokenFromServer() {
  const curr = await _GetCurr();
  const fromAddress = curr["address"];

  const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
  const response = await fetch(CrawlingServerUrl);

  const result = await response.json();
  console.log(result);
  // let msg = result;
  let msg = "";
  for (let i = 0; i < result["tokens"]["name"].length; i++) {
    const comb =
      result["tokens"]["name"][i] +
      " (" +
      result["tokens"]["sym"][i] +
      ") : " +
      result["tokens"]["bal"][i] +
      "\n";
    msg += comb;
  }
  msg += "\nwill be loaded to your account";
  // console.log(msg);
  _SendMsg("_0604", msg);
}

async function _AutoLoad() {
  const all = await _GetAll();
  const currIdx = all["currAcc"];
  const curr = all["accList"][currIdx];
  const fromAddress = curr["address"];

  const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
  const response = await fetch(CrawlingServerUrl);

  const result = await response.json();
  chrome.storage.sync.get(null, function (obj) {
    for (let i = 0; i < result["tokens"]["name"].length; i++) {
      let tokInfo = [
        result["tokens"]["name"][i],
        result["tokens"]["sym"][i],
        result["tokens"]["bal"][i],
        result["tokens"]["link"][i],
      ];
      obj["accList"][currIdx]["balance"].push(tokInfo);
    }
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
      alert("Loaded");
      GoHome();
    });
  });
}

// const tokList = curr["balance"];
// let options = "<option value=ether>ether</option>";
// for (let i = 0; i < tokList.length; i++) {
//   options +=
//     "<option value=" + tokList[i][0] + ">" + tokList[i][0] + "</option>";
//   // $("#_0304_select_transition").append(selectOptions);
//   // https://24hours-beginner.tistory.com/98
// }
// console.log(options);
// _SendMsg("_0401", options);
