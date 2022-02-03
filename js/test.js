$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  _SendMsg("_0304");
  AddOptions();
});

$("#_0304_button_enter").click(function () {
  // 가져오는 방법 제이쿼리로 하기

});



async function AddOptions() { 
  let accList = await _GetList();
  for (let i=0; i<accList.length; i++){
    let selectOptions = "<option value="+i+">"+accList[i]["name"]+"</option";
    $("#_0304_select_transition").append(selectOptions);
    // https://24hours-beginner.tistory.com/98
  }  
}

function AccountTransition(idx){
  chrome.storage.sync.get(null, function (obj) {
    obj["currAcc"]=idx;
    chrome.storage.sync.set(obj, function () {
      console.log("Saved");
      console.log(obj);
    });
  });

}