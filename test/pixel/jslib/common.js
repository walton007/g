const path = require('path');
const fs = require('fs');
const url = require('url');
const {
  BrowserWindow
} = require('electron');

const PIXEL_PATH = path.join(__dirname, '..');

function getJobsByScanHtmls() {
  const jobs = fs.readdirSync(PIXEL_PATH)
    .filter(filename => filename.endsWith('.html'))
    .map(filename => {
      return {
        filename,
        pathname: path.join(PIXEL_PATH, filename),
        dstImgPath: path.join(PIXEL_PATH, 'screenshots', filename.replace('.html', '.png')),
        done: false,
        winId: null
      };
    });

  return jobs;
}

async function capturePage(win, rect) {
  return new Promise(resolve => {
    win.capturePage(rect,
      resolve);
  });
}

async function saveFile(pngBuf, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, pngBuf, err => {
      if (err) {
        return reject(err);
      }
      resolve(null);
    });
  });
}

function createBrowserWindowForJobs(jobs) {
  jobs.forEach(job => {
    const win = new BrowserWindow({
      show: false,
      width: 1000,
      height: 1000,
      webPreferences: {
        preload: path.join(__dirname, 'inject.js')
      }
    });
    win.loadURL(url.format({
      pathname: job.pathname,
      protocol: 'file:'
    }));
    job.winId = win.id;
    // win.webContents.openDevTools();
  });
  
}

module.exports = {
  getJobsByScanHtmls,
  saveFile,
  capturePage,
  createBrowserWindowForJobs
};