const {
  BrowserWindow,
  nativeImage,
  app,
  ipcMain
} = require('electron');

const {
  getJobsByScanHtmls,
  capturePage,
  createBrowserWindowForJobs
} = require('./common');

async function compareNativeImgs(nativeImg1, nativeImg2) {
  const bmp1 = nativeImg1.getBitmap();
  const bmp2 = nativeImg2.getBitmap();

  if (bmp1.length !== bmp2.length) {
    return {
      equal: false, rate: 1
    };
  }
  if (bmp1.length === 0) {
    return {
      equal: true, rate: 0
    };
  }

  let errCnt = 0;
  const pixelCnt = bmp1.length / 4;
  for (let i = 0; i < pixelCnt;) {
    const v1 = bmp1.readUInt32BE(i * 4);
    const v2 = bmp2.readUInt32BE(i * 4);
    if (v1 !== v2) {
      errCnt++;
    }
    i = i + 4;
  }

  return {
    equal: errCnt === 0,
    rate: errCnt / pixelCnt
  };
}

async function compareCapturePageWithImgFile(win, rect, filePath, callback) {
  const nativeImgWin = await capturePage(win, rect);
  const nativeImgLocal = nativeImage.createFromPath(filePath);
  const result = await compareNativeImgs(nativeImgWin, nativeImgLocal);
  callback(result);
}

function jobDone(jobs, job, result) {
  // console.log('jobDone', job, result);
  job.done = true;
  job.result = result;

  const unfinishedJob = jobs.find(job => job.done === false);
  if (!unfinishedJob) {
    // TBD: when all job done:  quit app or show result ?
    let hasError = false;

    // dump result
    jobs.forEach(job => {
      if (job.result.equal === false) {
        hasError = true;
        console.log(`[WARN] ${job.filename} render wrong different rate: ${job.result.rate}`);
      }
    });

    if (!hasError) {
      console.log('Congratulatiions! Everything goes well!');
    }

    console.log('all job finished! App Quit');
    app.quit();
  }
}

function onAppReady() {
  const jobs = getJobsByScanHtmls();

  ipcMain.on('draw-done', (event, { winId, rect }) => {
    const win = BrowserWindow.fromId(winId);
    const job = jobs.find(job => job.winId === winId);
    compareCapturePageWithImgFile(win, rect, job.dstImgPath, jobDone.bind(null, jobs, job));
  });

  createBrowserWindowForJobs(jobs);
}

app.on('ready', onAppReady);
