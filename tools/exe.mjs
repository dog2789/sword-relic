// PC 앱 exe 만들기: 버전을 맨 위 package.json에서 넘김 (npm run app:exe)
import {execSync} from 'node:child_process';import {readFileSync} from 'node:fs';
const v=JSON.parse(readFileSync('package.json','utf8')).version;
execSync('npx electron-builder --win portable nsis -c.extraMetadata.version='+v,{cwd:'desktop',stdio:'inherit'});
