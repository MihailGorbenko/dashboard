
const childProcess = require('child_process');
const Log = require('./logger');
const log = new Log('ResizeImage')


function resizeImage(path, width, heigth) {
  log.info('Spawn resize');
  const resize = childProcess.spawnSync('python3 utils/resize.py', [`${path}`, `${heigth}`, `${width}`],
    {
      stdio: 'inherit',
      shell: true,
    });

}



module.exports = resizeImage