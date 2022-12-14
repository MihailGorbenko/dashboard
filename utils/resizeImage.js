
const childProcess = require('child_process');


function resizeImage(path,width,heigth){
    console.log('call spawn');
   const resize = childProcess.spawnSync('python3 utils/resize.py', [`${path}`,`${heigth}`,`${width}`],
   {
      stdio: 'inherit',
      shell: true,
    });
  
}



module.exports = resizeImage