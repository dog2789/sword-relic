/* 골드, 대장장이(무기 강화), 잡화점
   PlayScene에 섞어 쓰는 함수 모음 (Object.assign(PlayScene.prototype, Economy)) */
import Phaser from 'phaser';
import {W,H,HUD,MOBILE} from '../config.js';
import {ITEMS,CONSUMABLES,WLV_MAX,wlvCost,wlvAtk,weaponName} from '../data/items.js';
import {STATE} from '../state.js';
import {sfx} from '../sfx.js';
import {F9,F11} from '../fonts.js';

const fix=(o,d=210)=>o.scene.toOvl(o,d);
const SHOP=[{id:'potion',price:30},{id:'ether',price:40}];

export const Economy={
  /* 몬스터가 떨어뜨리는 골드: 값만큼 동전 1~4개로 나눠서 튀어나옴 */
  dropGold(x,y,amount){
    amount=Math.max(1,Math.round(amount));const n=Math.min(4,Math.max(1,Math.ceil(amount/8)));
    for(let i=0;i<n;i++){const v=i<n-1?Math.floor(amount/n):amount-Math.floor(amount/n)*(n-1);
      const c=this.hearts.create(x,y,amount>=60?'coinbig':'coin');c.kind='gold';c.val=v;
      c.setVelocity((Math.random()-.5)*90,-150-Math.random()*60).setBounce(0.45).setDepth(7);c.body.setSize(6,6);c.life=14}
  },
  takeGold(v,x,y){
    STATE.gold=(STATE.gold||0)+v;this.goldShow=1.2;sfx('coin');
    this.popText(x,y-6,'+'+v+'G',0xffd34a);
  },

  /* ---------- 공용 목록 메뉴 (대장장이, 상점) ---------- */
  openList(title,build,pick,color='#ffe27a'){
    if(this.overlayOpen())return;this.pauseWorld();
    const L=this.listm={sel:0,top:0,objs:[],rows:[],build,pick,title};
    L.g=fix(this.add.graphics());L.objs.push(L.g);
    const t=(x,y,s,o={})=>{const o2=fix(this.add.text(x,y,s,Object.assign({fontFamily:F9,fontSize:'10px',color:'#ece7f7'},o)));L.objs.push(o2);return o2};
    t(30,22,title,{fontFamily:F11,fontSize:'12px',color});
    L.gold=t(MOBILE?246:290,24,'',{color:'#ffd34a'}).setOrigin(1,0);
    for(let i=0;i<6;i++){const y=44+i*17;
      const icon=fix(this.add.image(42,y+6,'coin'));L.objs.push(icon);
      const a=t(54,y+1,''),b=t(290,y+1,'').setOrigin(1,0);
      const z=fix(this.add.zone(30,y-2,262,16).setOrigin(0).setInteractive());L.objs.push(z);
      z.on('pointerdown',()=>{if(L.top+i<L.items.length){L.sel=L.top+i;this.listPick()}});
      L.rows.push({icon,a,b,z})}
    // 6줄보다 많으면 위아래로 넘겨 봄: 남은 게 있다는 표시 (누르면 한 칸씩)
    L.up=t(160,33,'▲',{color:'#ffe27a'}).setOrigin(0.5).setInteractive().on('pointerdown',()=>{L.sel=Math.max(0,L.top-1);this.drawList()});
    L.dn=t(160,166,'▼',{color:'#ffe27a'}).setOrigin(0.5).setInteractive().on('pointerdown',()=>{L.sel=Math.min(L.items.length-1,L.top+6);this.drawList()});
    L.desc=t(30,146,'',{color:'#cfc8e4',wordWrap:{width:262},lineSpacing:2});
    if(!MOBILE)t(290,159,'Z 선택   X 나가기',{color:'#6f6890'}).setOrigin(1,0);
    const bz=fix(this.add.zone(-this.ovl.x,0,W,16).setOrigin(0).setInteractive());bz.on('pointerdown',()=>this.closeList());L.objs.push(bz);
    if(MOBILE)this.addCloseBtn(291,21,L.objs,()=>this.closeList());
    this.navReset();this.drawList();
  },
  drawList(){
    const L=this.listm,g=L.g;L.items=L.build();g.clear();
    if(L.sel>=L.items.length)L.sel=Math.max(0,L.items.length-1);
    g.fillStyle(0x05030b,0.7).fillRect(-this.ovl.x,0,W,H);
    g.fillStyle(0x161028,0.98).fillRect(22,14,276,160);g.lineStyle(1,0xc9a24a,1).strokeRect(22.5,14.5,275,159);
    g.fillStyle(0x221a3a,1).fillRect(26,140,268,18);
    L.gold.setText((STATE.gold||0)+' G');
    L.top=Phaser.Math.Clamp(L.top,L.sel-5,L.sel);L.top=Math.max(0,Math.min(L.top,L.items.length-6));
    L.up.setVisible(L.top>0);L.dn.setVisible(L.top+6<L.items.length);
    L.rows.forEach((r,i)=>{const it=L.items[L.top+i],on=!!it;
      r.icon.setVisible(on);r.a.setVisible(on);r.b.setVisible(on);if(!on)return;
      if(L.top+i===L.sel){g.fillStyle(0x2c2346,1).fillRect(30,42+i*17,262,16);g.lineStyle(1,0xffe27a,1).strokeRect(30.5,42.5+i*17,261,15)}
      r.icon.setTexture(it.icon);r.a.setText(it.label).setColor(it.ok===false?'#6f6890':'#ece7f7');
      r.b.setText(it.right||'').setColor(it.ok===false?'#8a5a6a':'#ffd34a')});
    const cur=L.items[L.sel];L.desc.setText(cur?cur.desc||'':'');
  },
  listPick(){const L=this.listm,it=L.items[L.sel];if(!it)return;if(it.ok===false){this.cameras.main.shake(60,0.002);return}L.pick(it,this);if(this.listm)this.drawList()},
  updateList(){
    const L=this.listm,n=this.navPress(),k=L.items.length||1;
    if(n.up){L.sel=(L.sel+k-1)%k;this.drawList()}
    if(n.down){L.sel=(L.sel+1)%k;this.drawList()}
    if(n.x||n.back)this.closeList();else if(n.ok)this.listPick();
  },
  closeList(){const L=this.listm;if(!L)return;L.objs.forEach(o=>o.destroy());this.listm=null;this.resumeWorld();this.prev=this.heldNow()},

  /* ---------- 대장장이: 가진 무기를 골드로 강화 (+1 ~ +8) ---------- */
  openSmith(){
    this.openList('대장간 · 무기 강화',()=>STATE.bag.filter(id=>ITEMS[id]&&ITEMS[id].slot==='weapon').map(id=>{
      const it=ITEMS[id],lv=(STATE.wlv||{})[id]||0,max=lv>=WLV_MAX,cost=max?0:wlvCost(lv),ok=!max&&STATE.gold>=cost;
      return{id,icon:'icon_'+id,label:weaponName(id)+(this.equip.weapon===id?'  (장착)':''),right:max?'최대':cost+' G',ok,
        desc:max?'더 이상 강화할 수 없을 만큼 단련된 검이다.':'공격 '+((it.atk||0)+wlvAtk(lv))+' → '+((it.atk||0)+wlvAtk(lv+1))+'   '+(ok?'Z를 누르면 강화해요':'골드가 모자라요')}}),
    (row,s)=>{
      const lv=(STATE.wlv||{})[row.id]||0,cost=wlvCost(lv);if(STATE.gold<cost)return;
      STATE.gold-=cost;(STATE.wlv||(STATE.wlv={}))[row.id]=lv+1;
      s.shake(90,0.006);s.goldEm.explode(18,s.player.x,s.player.y-6);s.sparkEm.explode(10,s.player.x,s.player.y-6);
      s.toast(weaponName(row.id)+'! 이제 조금 더 강해졌을 거야.',2400);
    },'#ffb04a');
  },

  /* ---------- 잡화점: 물약 ---------- */
  openShop(){
    this.openList('잡화점',()=>SHOP.map(s=>{const c=CONSUMABLES[s.id],ok=STATE.gold>=s.price;
      return{id:s.id,price:s.price,icon:'icon_'+s.id,label:c.name+'  (가진 개수 '+(STATE.items[s.id]||0)+')',right:s.price+' G',ok,desc:c.desc+'   '+(ok?'Z를 누르면 1개 사요':'골드가 모자라요')}}),
    (row,s)=>{if(STATE.gold<row.price)return;STATE.gold-=row.price;STATE.items[row.id]=(STATE.items[row.id]||0)+1;
      s.goldEm.explode(8,s.player.x,s.player.y-6);s.toast(CONSUMABLES[row.id].name+' 1개를 샀어요',1600)});
  }
};
