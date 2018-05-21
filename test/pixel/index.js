const doScreenshot = process.argv.indexOf('--screenshot');
if (doScreenshot >= 0) {
  require('./jslib/screenshot');
} else {
  require('./jslib/screenshot_verify');
}
