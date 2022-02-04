/*
	background.js

	팝업창의 dom을 변환한다.
*/

let cont = "default";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "syncpage") {
    SyncView();
  } else if (request.msg === "_0304") {
    ChangeViewWithSelect(request.msg, request.data);
    console.log("TESTETS");
  } else {
    ChangeViewWithScreen(request.msg, request.data);
  }
});

function ChangeViewWithScreen(msg, data) {
  let views = chrome.extension.getViews({
    type: "popup",
  });
  console.log(data["screen"]);

  //   views[0].document.getElementsByTagName("html")[0].innerHTML = cont;
  views[0].document.write(readTextFile(msg));
  views[0].document.close();
  if (data["screen"] != undefined) {
    views[0].document.getElementById("screen").innerText = data["screen"];
  }
  cont = views[0].document.documentElement.outerHTML;

  console.log("CHANGEVIEW");
  console.log(cont);
}

function ChangeViewWithSelect(msg, data) {
  let views = chrome.extension.getViews({
    type: "popup",
  });
  console.log(data["option"]);

  views[0].document.write(readTextFile(msg));
  views[0].document.close();
  // console.log(
  //   views[0].document.getElementById("_0304_select_transition").innerHTML
  // );
  views[0].document.getElementById("_0304_select_transition").innerHTML =
    data["option"];
  cont = views[0].document.documentElement.outerHTML;
}

function SyncView() {
  if (cont != "default") {
    let views = chrome.extension.getViews({
      type: "popup",
    });
    // views[0].document.getElementById("main_body").innerHTML = cont;
    views[0].document.write(cont);
    // views[0].document.getElementsByTagName("html")[0].innerHTML = cont;
    views[0].document.close();

    console.log("SYNCVIEW");
  }
}

function readTextFile(file) {
  file = "./htmls/" + file + ".html";
  res = "";
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        var allText = rawFile.responseText;
        res = allText;
      }
    }
  };
  rawFile.send(null);
  return res;
}
