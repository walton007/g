// notify main process we're ready
const { ipcRenderer, remote } = require('electron');

const curWinId = remote.getCurrentWindow().id;

window.sendReadySignal = (rect) => {
  const msg = {
    winId:curWinId,
    rect
  };

  setTimeout(() => {
    if (document.readyState === 'complete') {
      ipcRenderer.send('draw-done', msg);
    } else {
					// send signal after window.onload
      window.onload = () => {
        ipcRenderer.send('draw-done', msg);
      };
    }
  }, 100);
};
