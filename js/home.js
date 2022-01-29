// Goto Home page
$("#_home").click(function () {
  console.log("QQQQQQQQQQQQQQ");
  GoHome();
});

// Get current account's balance and address
$("#_balance").click(function () {
  //   console.log("dddd");
  //   console.log(_GetAddress); //
  //   // Send to Home and Append Balance
  //   //   let add = "0x5CCE38322F190EAB8Abc7Ceb23E816Cf7d3b48DC";
  //   let bal;
});

async function GoHome() {
  const address = await _GetAddress();
  let bal;
  let msg = "current account:\nbalance: ";

  _GetBalance(address).then((result) => {
    bal = result;
    msg = msg + bal + address;
    _SendMsg("_0201", msg);
  });
}
