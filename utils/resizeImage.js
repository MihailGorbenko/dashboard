
const childProcess = require('child_process');
const Log = require('./logger');
const log = new Log('ResizeImage')


function resizeImage(filePath, resultPath, height, width, detectFaces,maxFaces = 1) {
  log.info('Spawn resize');
  const detect = detectFaces === 'true' ? '--detect': ''

  const resize = childProcess.spawnSync('python3 utils/resize.py',
   [
    `${filePath}`,
    `${resultPath}`,
    `--height ${height}`, 
    `--width ${width}`,
    `--max-faces ${maxFaces}`,
    `${detect}`
  
   ],
    {
      stdio: 'inherit',
      shell: true,
    });

}



module.exports = resizeImage