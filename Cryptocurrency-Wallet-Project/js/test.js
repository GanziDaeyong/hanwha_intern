$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

$("#test").click(function () {
  // _SendMsg("dev");
  LoadingWithMask();
  // _SendMsg("dev");
});

function Loading() {
  let loadingImg = "<img id='loadingImg' src='../loading.svg'/>";
  $("#main_body").append(loadingImg);
}
function UnLoading() {
  let loadingImg = "<img id='loadingImg' src='../loading.svg'/>";
  $("#main_body").remove("#loadingImg");
}
// //화면에 출력할 마스크를 설정해줍니다.
// var mask       ="<div id='mask' style='position:absolute; z-index:9000; background-color:#000000; display:none; left:0; top:0;'></div>";
// var loadingImg ='';

// loadingImg +="<div id='loadingImg'>";
// loadingImg +=" <img src='LoadingImg.gif' style='position: relative; display: block; margin: 0px auto;'/>";
// loadingImg +="</div>";

// //화면에 레이어 추가
// $('body')
//     .append(mask)
//     .append(loadingImg)

// //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채웁니다.
// $('#mask').css({
//         'width' : maskWidth
//         ,'height': maskHeight
//         ,'opacity' :'0.3'
// });

// //마스크 표시
// $('#mask').show();

// //로딩중 이미지 표시
// $('#loadingImg').show();
// }

// // $("#_0601_button_autoload").click(function () {

// $("#_0601_button_autoload").click(function () {
//   _GetTokenFromServer();
// });

// $("#_0604_button_load").click(function () {
//   _AutoLoad();
// });

// async function _GetTokenFromServer() {
//   const curr = await _GetCurr();
//   const fromAddress = curr["address"];

//   const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
//   const response = await fetch(CrawlingServerUrl);

//   const result = await response.json();
//   console.log(result);
//   // let msg = result;
//   let msg = "";
//   for (let i = 0; i < result["tokens"]["name"].length; i++) {
//     const comb =
//       result["tokens"]["name"][i] +
//       " (" +
//       result["tokens"]["sym"][i] +
//       ") : " +
//       result["tokens"]["bal"][i] +
//       "\n";
//     msg += comb;
//   }
//   msg += "\nwill be loaded to your account";
//   // console.log(msg);
//   _SendMsg("_0604", msg);
// }

// async function _AutoLoad() {
//   const all = await _GetAll();
//   const currIdx = all["currAcc"];
//   const curr = all["accList"][currIdx];
//   const fromAddress = curr["address"];

//   const CrawlingServerUrl = "http://localhost:3000/api/address/" + fromAddress;
//   const response = await fetch(CrawlingServerUrl);

//   const result = await response.json();
//   chrome.storage.sync.get(null, function (obj) {
//     for (let i = 0; i < result["tokens"]["name"].length; i++) {
//       let tokInfo = [
//         result["tokens"]["name"][i],
//         result["tokens"]["sym"][i],
//         result["tokens"]["bal"][i],
//         result["tokens"]["link"][i],
//       ];
//       obj["accList"][currIdx]["balance"].push(tokInfo);
//     }
//     chrome.storage.sync.set(obj, function () {
//       console.log("Saved");
//       console.log(obj);
//       alert("Loaded");
//       GoHome();
//     });
//   });
// }

// // const tokList = curr["balance"];
// // let options = "<option value=ether>ether</option>";
// // for (let i = 0; i < tokList.length; i++) {
// //   options +=
// //     "<option value=" + tokList[i][0] + ">" + tokList[i][0] + "</option>";
// //   // $("#_0304_select_transition").append(selectOptions);
// //   // https://24hours-beginner.tistory.com/98
// // }
// // console.log(options);
// // _SendMsg("_0401", options);
