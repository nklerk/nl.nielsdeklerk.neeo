function settings_btn_discoverbrains() {
  Homey.api("GET", "/discover/");
  discover_brains_loop(0);
}

function discover_brains_loop(count) {
  if (count < 10) {
    count = count + 1;
    setTimeout(discover_brains_loop, 500, count);
  } else {
    readMyBrains();
  }
}

function download(filename, text) {
  let pom = document.createElement("a");
  pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  pom.setAttribute("download", filename);
  if (document.createEvent) {
    let event = document.createEvent("MouseEvents");
    event.initEvent("click", true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}
