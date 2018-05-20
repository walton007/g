const doScreenshot = process.argv.indexOf('--screenshot');
if (doScreenshot >= 0) {
  require('./lib/screenshot');
} else {
  require('./lib/screenshot_verify');
}
