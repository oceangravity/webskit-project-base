// import { exec } from 'child_process'
//
// exec(`npm run dev`, (error, stdout, stderr) => {
//   console.log('CULO PODRIO')
//   console.log(stdout, error, stderr);
// });

import { exec } from 'child_process'
exec('cd vite-server && npm run dev', (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
