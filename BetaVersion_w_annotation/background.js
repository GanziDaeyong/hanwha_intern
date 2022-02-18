try {
  let cont = "default";
} catch (ex) {}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "syncpage") {
    SyncView();
  } else if (request.msg === "_0304" || request.msg === "_0401") {
    ChangeViewWithSelect(request.msg, request.data);
  } else {
    ChangeViewWithHTML(request.msg, request.data);
  }
});

/**
 * Change or overwrite html to given page and with additional contents
 * @function ChangeViewWithHTML
 * @param  {string} msg - html page to change
 * @param  {} data - additional html content
 */
function ChangeViewWithHTML(msg, data) {
  let views = chrome.extension.getViews({
    type: "popup",
  });

  views[0].document.write(readTextFile(msg));
  views[0].document.close();
  if (data["screen"] != undefined) {
    views[0].document.getElementById("screen").innerHTML = data["screen"];
  }
  cont = views[0].document.documentElement.outerHTML;
}

// function ChangeViewWithScreen(msg, data) {
//   let views = chrome.extension.getViews({
//     type: "popup",
//   });
//   console.log(data["screen"]);

//   //   views[0].document.getElementsByTagName("html")[0].innerHTML = cont;
//   views[0].document.write(readTextFile(msg));
//   views[0].document.close();
//   if (data["screen"] != undefined) {
//     views[0].document.getElementById("screen").innerText = data["screen"];
//   }
//   cont = views[0].document.documentElement.outerHTML;
// }

/**
 * Change or overwrite html with select element to given page and with additional contents
 * @function ChangeViewWithSelect
 * @param  {string} msg - html page to change
 * @param  {} data - additional html content
 */
function ChangeViewWithSelect(msg, data) {
  let views = chrome.extension.getViews({
    type: "popup",
  });
  views[0].document.write(readTextFile(msg));
  views[0].document.close();
  if (msg == "_0304") {
    views[0].document.getElementById("_0304_select_transition").innerHTML =
      data["option"];
  }
  if (msg == "_0401") {
    views[0].document.getElementById("_0401_select_transition").innerHTML =
      data["option"];
  }
  cont = views[0].document.documentElement.outerHTML;
}

/**
 * Synchronize page to the last opened html in case extension is closed
 * @function SyncView
 */
function SyncView() {
  if (cont != "default") {
    let views = chrome.extension.getViews({
      type: "popup",
    });
    views[0].document.write(cont);
    views[0].document.close();
  }
}
/**
 * Read given html file as a string. Html files are located on ./htmls
 * @function readTextFile
 * @param  {string} file - html file name
 * @returns {string} string-fied html file
 */
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
