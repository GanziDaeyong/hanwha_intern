let alreadysynced = 0;
if (alreadysynced == 0) {
  SendSyncMsg();
}
/**
 * Send message to backgroundjs to let page synced
 * @function SendSyncMsg
 */
function SendSyncMsg() {
  chrome.runtime.sendMessage({ msg: "syncpage" });
  alreadysynced = 1;
}
