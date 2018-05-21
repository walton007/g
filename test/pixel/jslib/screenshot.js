const {
  BrowserWindow,
  app,
  ipcMain
} = require('electron');

const {
  getJobsByScanHtmls,
  capturePage,
  saveFile,
  createBrowserWindowForJobs
} = require('./common');

async function capturePageToFile(win, rect, filePath, callback) {
  const nativeImg = await capturePage(win, rect);
  const pngBuf = nativeImg.toPNG();
  await saveFile(pngBuf, filePath);
  callback();
}

function jobDone(jobs, job) {
  // console.log('jobDone', job);
  job.done = true;

  const unfinishedJob = jobs.find(job => job.done !== true);
  if (!unfinishedJob) {
    // TBD: when all job done:  quit app or show result ?
    console.log('all job finished! App Quit');
    app.quit();
  }
}

function onAppReady() {
  const jobs = getJobsByScanHtmls();

  ipcMain.on('draw-done', (event, { winId, rect }) => {
    const win = BrowserWindow.fromId(winId);
    const job = jobs.find(job => job.winId === winId);
    capturePageToFile(win, rect, job.dstImgPath, jobDone.bind(null, jobs, job));
  });
  createBrowserWindowForJobs(jobs);
}

app.on('ready', onAppReady);
