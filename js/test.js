$("#reset").click(function () {
  web3.eth.accounts.wallet.clear();
  chrome.storage.sync.clear(function () {});
  alert("CLEARED");
});

// $("#_home").click(function () {
//   console.log("QQQQQQQQQQQQQQ");
//   _SendMsg("_0201");
// });
