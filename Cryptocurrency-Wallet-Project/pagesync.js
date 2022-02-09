/*
	팝업창의 싱크를 크롬창의 생애 주기에 맞게 동기화한다.
*/

// try {
//   let alreadysynced = 0;
// } catch (ex) {
//   console.log("to console");
// }
// console.log("Turned");
// let alreadysynced = 0;
let alreadysynced = 0;

if (alreadysynced == 0) {
  SendSyncMsg();
}

function SendSyncMsg() {
  chrome.runtime.sendMessage({ msg: "syncpage" });
  console.log("being synced");
  alreadysynced = 1;
}
