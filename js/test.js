$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});
