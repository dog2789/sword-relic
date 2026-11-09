// 소드 레릭 PC 앱: 웹 빌드(../dist)를 app:// 주소로 띄움 (파일 주소면 /assets/... 같은 절대 경로가 깨져서)
const {app,BrowserWindow,protocol,net,Menu}=require('electron');
const path=require('path'),fs=require('fs');const {pathToFileURL}=require('url');
// exe로 묶었을 땐 resources/game, 개발 중엔 ../dist
const DIST=path.resolve(process.env.SR_DIST||(app.isPackaged?path.join(process.resourcesPath,'game'):path.join(__dirname,'..','dist')));
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
app.whenReady().then(()=>{
  protocol.handle('app',req=>{
    const p=path.normalize(path.join(DIST,decodeURIComponent(new URL(req.url).pathname)));
    if(!p.startsWith(DIST))return new Response('',{status:403});   // dist 밖은 못 읽게
    const f=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;   // /save/ 같은 폴더 주소는 그 안의 index.html
    if(!fs.existsSync(f))return new Response('',{status:404});   // 웹 전용 파일(방문자 통계 등)은 없음
    return net.fetch(pathToFileURL(f).toString());
  });
  Menu.setApplicationMenu(null);
  const win=new BrowserWindow({width:1280,height:780,minWidth:640,minHeight:400,backgroundColor:'#000000',title:'소드 레릭',
    icon:path.join(DIST,'icon-512.png'),autoHideMenuBar:true,webPreferences:{contextIsolation:true,sandbox:true}});
  win.loadURL('app://game/play/index.html?app=pc');
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));   // 링크로 새 창 안 띄움
  win.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault()}});
});
app.on('window-all-closed',()=>app.quit());
