/* 장비창(I): [장비] 칸마다 모든 장비를 도감처럼 나열 / [상태] 능력치, 시간, 열쇠, 능력
   C 탭 바꾸기, ←→↑↓ 고르기, Z 장착·해제, I/ESC 닫기 */
import Phaser from 'phaser';
import {W,H,VP,MOBILE,keyText} from '../config.js';
import {ITEMS,SETS,SLOTS,SLOT_NAMES,KEYS,setProgress,statLine,weaponName} from '../data/items.js';
import {ROOMS} from '../world/rooms.js';
import {STATE,bossDone} from '../state.js';
import {skillOf} from './skills.js';
import {isDown} from '../input.js';
import {F9,F11} from '../fonts.js';

const fix=(o,d=200)=>o.scene.toOvl(o,d);
const CX=64,CW=17,RY=34,RH=17,VIS=7;   // 한 줄에 7칸까지 보이고, 더 있으면 옆으로 넘어감
const slotItems=sl=>Object.keys(ITEMS).filter(id=>ITEMS[id].slot===sl&&!ITEMS[id].hidden);
const hms=t=>{t=Math.floor(t||0);const h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=t%60;return(h?h+':':'')+String(m).padStart(h?2:1,'0')+':'+String(s).padStart(2,'0')};

export const MenuMixin={
  toggleMenu(){if(this.menu)this.closeMenu();else this.openMenu()},
  openMenu(){
    if(this.player.dead||this.leaving||this.overlayOpen())return;this.pauseWorld();
    const M=this.menu={tab:0,r:0,c:0,objs:[],dyn:[]};
    M.g=fix(this.add.graphics());M.objs.push(M.g);
    M.t=(x,y,s,o={},keep=true)=>{const t=fix(this.add.text(x,y,s,Object.assign({fontFamily:F9,fontSize:'10px',color:'#ece7f7'},o)));(keep?M.objs:M.dyn).push(t);return t};
    M.tabs=['장비','상태'].map((n,i)=>{const t=M.t(28+i*44,13,n,{fontFamily:F11,fontSize:'12px'});t.setInteractive().on('pointerdown',()=>{M.tab=i;this.buildTab()});return t});
    if(MOBILE){M.hintC=M.t(246,15,'C 다음 칸',{color:'#8f86ab'}).setOrigin(1,0);this.addCloseBtn(302,12,M.objs,()=>this.closeMenu())}
    else M.t(300,15,keyText('C 탭   I 닫기'),{color:'#8f86ab'}).setOrigin(1,0);
    const r=this.equip.weapon?SLOTS.indexOf('weapon'):0;M.r=r;M.c=Math.max(0,slotItems(SLOTS[r]).indexOf(this.equip[SLOTS[r]]));
    this.buildTab();this.navReset();
  },
  clearDyn(){const M=this.menu;M.dyn.forEach(o=>o.destroy());M.dyn=[]},
  buildTab(){
    const M=this.menu;this.clearDyn();
    M.tabs.forEach((t,i)=>t.setColor(i===M.tab?'#ffe27a':'#6f6890'));if(M.hintC)M.hintC.setVisible(M.tab===0);
    const img=(x,y,k,d=201)=>{const o=fix(this.add.image(x,y,k),d);M.dyn.push(o);return o};
    if(M.tab===0){
      M.cells=SLOTS.map((sl,r)=>{M.t(22,RY+r*RH+2,SLOT_NAMES[sl],{color:'#8f86ab'},false);
        return slotItems(sl).map((id,c)=>{const x=CX+c*CW+8,y=RY+r*RH+7,o=img(x,y,'icon_'+id);
          const z=fix(this.add.zone(x-8,y-8,16,16).setOrigin(0).setInteractive());M.dyn.push(z);
          z.on('pointerdown',()=>{if(M.r===r&&M.c===c)this.equipCell();else{M.r=r;M.c=c;this.drawMenu()}});
          return{id,o,z}})});
      M.off=SLOTS.map(()=>0);
      M.arr=SLOTS.map((sl,r)=>[M.t(CX-9,RY+r*RH+2,'◀',{color:'#ffe27a'},false),M.t(CX+VIS*CW+1,RY+r*RH+2,'▶',{color:'#ffe27a'},false)]);
      // 노란 화살표를 누르면 그 줄을 한 칸씩 넘김
      M.arr.forEach((pair,r)=>pair.forEach((a,k)=>{const hz=fix(this.add.zone(a.x-3,a.y-3,a.width+6,a.height+6).setOrigin(0).setInteractive(),202);M.dyn.push(hz);a.hz=hz;hz.on('pointerdown',()=>{if(!a.visible)return;
        const n=M.cells[r].length;if(!n)return;if(M.r!==r){M.r=r;M.c=k?Math.min(n-1,M.off[r]+VIS):Math.max(0,M.off[r]-1)}else M.c=Math.max(0,Math.min(n-1,M.c+(k?1:-1)));this.drawMenu()})}));
      M.hero=img(251,50,'hero_idle0').setScale(2);
      M.stat=M.t(206,70,'',{lineSpacing:0},false);
      M.name=M.t(22,122,'',{color:'#ffe27a'},false);
      M.zh=M.t(298,122,'',{color:'#8f86ab'},false).setOrigin(1,0);
      M.desc=M.t(22,134,'',{color:'#cfc8e4',wordWrap:{width:274},lineSpacing:0},false);
      M.sk=M.t(22,156,'',{color:'#9ff0ff',wordWrap:{width:274},lineSpacing:0},false);
    }else{
      img(48,74,'hero_idle0').setScale(2);
      M.t(48,96,STATE.name||'모험가',{color:'#ffe27a'},false).setOrigin(0.5,0);
      const s=this.stats,b=this.bonus,ex=this.explorePct?this.explorePct():0;
      M.t(90,36,['LV','HP','MP','공격','방어','EXP','골드','시간','탐험률'].join('\n'),{color:'#8f86ab',lineSpacing:1},false);
      M.t(130,36,[s.lv,Math.ceil(s.hp)+' / '+this.mhp(),Math.floor(s.mp)+' / '+s.maxMp,this.atkVal()+'  (+'+(this.atkVal()-s.atk)+')',this.defVal(),s.exp+' / '+s.next,(STATE.gold||0)+' G',hms(STATE.time),ex+'%'].join('\n'),{lineSpacing:1},false);
      M.t(214,34,'능력',{color:'#8f86ab'},false);
      const ab=[['2단 점프',!!STATE.abilities.djump],['벽 점프',!!this.bonus.wallCling],['빙판 걷기',!!this.bonus.noSlip]];
      ab.forEach(([n,on],i)=>M.t(222,48+i*12,(on?'● ':'○ ')+n,{color:on?'#9ff0ff':'#5a5478'},false));
      M.t(214,90,'열쇠',{color:'#8f86ab'},false);
      Object.keys(KEYS).forEach((k,i)=>{const o=img(228+i*18,110,'icon_key_'+k);if(!STATE.keys[k])o.setTintFill(0x2a2440)});
      // 전체 보스 수는 숨김 (몇 마리 남았는지 궁금하게)
      const bd=Object.values(ROOMS).filter(R=>R.boss).map(R=>R.boss.id||'king').filter(bossDone).length;
      M.t(214,124,'쓰러뜨린 보스  '+bd,{color:'#ffb0b0'},false);
    }
    this.drawMenu();
  },
  /* 다른 줄로 옮길 때 화면에서 보이는 같은 칸(열)으로 감 (줄마다 넘겨 본 위치가 달라서 번호로 옮기면 엉뚱한 데로 튐) */
  menuRow(nr){const M=this.menu,vis=M.c-(M.off[M.r]||0),n=M.cells[nr].length;
    M.r=nr;M.c=Math.max(0,Math.min(n-1,(M.off[nr]||0)+vis))},
  drawMenu(){
    const M=this.menu,g=M.g;g.clear();
    g.fillStyle(0x05030b,0.72).fillRect(-this.ovl.x,0,W,H);
    g.fillStyle(0x161028,1).fillRect(14,8,292,170);g.lineStyle(1,0xc9a24a,1).strokeRect(14.5,8.5,291,169);
    g.fillStyle(0x2c2346,1).fillRect(20+M.tab*44,11,40,16);g.lineStyle(1,0xffe27a,1).strokeRect(20.5+M.tab*44,11.5,39,15);
    g.fillStyle(0x3a2a5a,1).fillRect(18,28,284,1);
    if(M.tab!==0){g.fillStyle(0x221a3a,1).fillRect(20,32,58,96).fillRect(206,30,94,104);return}
    g.fillStyle(0x221a3a,1).fillRect(200,30,102,88);g.fillStyle(0x0f0b1e,1).fillRect(18,120,284,55);
    M.cells.forEach((row,r)=>{let o=M.off[r];if(r===M.r){if(M.c<o)o=M.c;if(M.c>=o+VIS)o=M.c-VIS+1}o=Math.max(0,Math.min(o,row.length-VIS));M.off[r]=o;
      M.arr[r][0].setVisible(o>0);M.arr[r][1].setVisible(o+VIS<row.length);M.arr[r].forEach(a=>{if(a.hz&&a.hz.input)a.hz.input.enabled=a.visible})});
    let cur=null;
    M.cells.forEach((row,r)=>row.forEach((c,ci)=>{const vc=ci-M.off[r],vis=vc>=0&&vc<VIS;c.o.setVisible(vis);c.z.setVisible(vis);if(c.z.input)c.z.input.enabled=vis;if(!vis)return;
      const x=CX+vc*CW,y=RY+r*RH-1,own=STATE.bag.includes(c.id),eq=this.equip[SLOTS[r]]===c.id;c.o.setPosition(x+8,y+8);c.z.setPosition(x,y);
      g.fillStyle(own?0x2a2244:0x120e1e,1).fillRect(x,y,16,16);
      if(own)c.o.clearTint().setAlpha(1);else c.o.setTintFill(0x302a48).setAlpha(1);
      if(eq){g.lineStyle(1,0xffd34a,1).strokeRect(x+0.5,y+0.5,15,15)}
      if(r===M.r&&ci===M.c)cur=[x,y]}));
    // 고른 칸 흰 테두리는 칸들을 다 칠한 뒤에 (먼저 그리면 오른쪽·아래 칸 배경이 덮어서 잘려 보임)
    if(cur)g.lineStyle(1,0xffffff,1).strokeRect(cur[0]-1.5,cur[1]-1.5,19,19);
    const b=this.bonus,lines=['공격 '+this.atkVal(),'방어 '+b.def,'HP '+this.mhp()];
    for(const k in SETS){const S=SETS[k],n=setProgress(this.equip,k);if(n)lines.push(S.name.replace(' 세트','')+' '+n+'/'+S.need+(n>=S.need?' ★':''))}
    M.stat.setText(lines.join('\n'));M.hero.setTexture('hero_idle0');
    const row=M.cells[M.r],cell=row[M.c];
    M.zh.setText('');M.sk.setText('');
    if(!cell){M.name.setText(SLOT_NAMES[SLOTS[M.r]]);M.desc.setText('');return}
    const it=ITEMS[cell.id],own=STATE.bag.includes(cell.id),eq=this.equip[SLOTS[M.r]]===cell.id;
    if(!own){M.name.setText('???');M.desc.setText('아직 얻지 못한 장비예요. 상자나 보스에게서 찾아보세요.');return}
    M.name.setText((it.slot==='weapon'?weaponName(cell.id):it.name)+'   '+statLine(it)+(eq?'  (장착 중)':''));
    M.zh.setText(eq?(it.slot==='weapon'?'':MOBILE?'다시 눌러 벗기':keyText('Z 벗기')):MOBILE?'다시 눌러 장착':keyText('Z 장착'));
    M.desc.setText(keyText(it.desc)+(it.set?'  ['+SETS[it.set].name+']':''));
    if(it.slot==='weapon'){const sk=skillOf(cell.id);M.sk.setText(keyText('C 스킬')+' 「'+sk.name+'」 MP '+sk.mp+' · '+sk.desc)}
  },
  equipCell(){
    const M=this.menu,sl=SLOTS[M.r],cell=M.cells[M.r][M.c];if(!cell||!STATE.bag.includes(cell.id))return;
    if(this.equip[sl]===cell.id){if(sl!=='weapon')this.setEquip(sl,null,false)}else this.setEquip(sl,cell.id,false);
    this.drawMenu();
  },
  closeMenu(){const M=this.menu;if(!M)return;[...M.objs,...M.dyn].forEach(o=>o.destroy());this.menu=null;this.resumeWorld();this.prev=this.heldNow()},
  updateMenu(){
    const M=this.menu,n=this.navPress(),c=this.ed('mtab',isDown('KeyC','KeyL')||VP.skill);
    if(c){if(MOBILE&&M.tab===0){this.menuRow((M.r+1)%SLOTS.length);this.drawMenu()}else{M.tab=MOBILE?0:(M.tab+1)%2;this.buildTab()}return}
    if(n.back||this.ed('mesc',isDown('Escape')||VP.back)){this.closeMenu();return}
    if(M.tab!==0)return;
    const NR=SLOTS.length,len=r=>Math.max(1,M.cells[r].length);
    if(n.up){this.menuRow((M.r+NR-1)%NR);this.drawMenu()}
    if(n.down){this.menuRow((M.r+1)%NR);this.drawMenu()}
    if(n.left){M.c=(M.c+len(M.r)-1)%len(M.r);this.drawMenu()}
    if(n.right){M.c=(M.c+1)%len(M.r);this.drawMenu()}
    if(n.ok)this.equipCell();
  }
};
