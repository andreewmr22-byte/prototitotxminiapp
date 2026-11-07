import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(path.join(root,'index.html'),'utf8');
const js=html.match(/<script defer>([\s\S]*?)<\/script>/)?.[1];
const css=html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert.ok(js && css,'central/index.html precisa conter JS e CSS internos');
const results=[];
const test=(name,fn)=>{try{fn();results.push({name,state:'PASS'});console.log('PASS',name);}catch(e){results.push({name,state:'FAIL'});console.error('FAIL',name,e.message);}};
for(const route of ['visao','whatsapp','acervo','listas','frentes','auditoria'])test('Rota HTML '+route,()=>assert.match(html,new RegExp(`id="${route}"`)));
test('Saídas externas sem acesso ao opener',()=>{for(const url of ['https://web.whatsapp.com/','https://web.telegram.org/','https://discord.com/app'])assert.match(html,new RegExp(`href="${url.replaceAll('.','\\.')}" target="_blank" rel="noopener noreferrer"`));});
test('Fontes preservadas por caminho relativo',()=>{for(const target of ['../index.html','../demos/7tx-laboratorio-chat-miniapp-r6.html','../tx-media-r2/index.html'])assert.ok(html.includes('href="'+target+'"'));});
test('Sem endpoint de mensagens ou login simulado',()=>{assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\b|sendMessage\s*\(/);assert.ok(html.includes('NÃO VERIFICADO'));});
test('Texto do usuário sem injeção de HTML',()=>{assert.ok(js.includes('textContent=value'));assert.doesNotMatch(js,/innerHTML\s*=/);});
test('Responsividade prevista',()=>{for(const width of [1230,800,480])assert.ok(css.includes(`max-width:${width}px`));});
test('Rodapé único de exportação',()=>{assert.ok(js.includes('Conferir materiais disponíveis no mesmo envio.'));assert.ok(html.includes('Sem envio automático'));});
class Element {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attrs={};this.value='';this.checked=false;this.dataset={};this.hidden=false;this.textContent='';this.className='';this.files=[];}
  addEventListener(type,fn){this.listeners[type]=fn;}
  emit(type,detail={}){return this.listeners[type]?.({preventDefault(){},currentTarget:this,target:{files:this.files,value:this.value},...detail});}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=[...items];}
  setAttribute(name,value){this.attrs[name]=value;}
  removeAttribute(name){delete this.attrs[name];}
  reset(){for(const id of ['item-name','item-quantity','item-price'])elements[id].value='';elements['item-media'].value='';}
  remove(){this.removed=true;}
  click(){this.emit('click');}
}
const ids=['main-content','section-heading','media-count-home','list-count-home','list-count','media-gallery','item-media','item-form','form-message','list-items','media-input','item-name','item-quantity','item-price','clear-list','export-list','copy-list','check-whatsapp','check-iphone','proof-updated','audit-rows','run-checks','net-state', 'visao','whatsapp','acervo','listas','frentes','auditoria'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
const navs=['visao','whatsapp','acervo','listas','frentes','auditoria'].map(x=>{const el=new Element('a');el.dataset.route=x;return el;});
const document={readyState:'complete',getElementById(id){return elements[id];},querySelectorAll(selector){return selector==='[data-route]'?navs:[];},querySelector(selector){return selector.includes('web.whatsapp.com')?new Element('a'):null;},createElement(tag){return new Element(tag);},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},body:new Element('body')};
const location={hash:'#visao',hostname:'localhost',protocol:'https:'};
const history={replaceState(_a,_b,hash){location.hash=hash;}};
const local=new Map();const localStorage={getItem(k){return local.get(k)||null;},setItem(k,v){local.set(k,v);},removeItem(k){local.delete(k);}};
let clipboardText='';const navigator={onLine:true,clipboard:{writeText:async(text)=>{clipboardText=text;}}};
const window={listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},emit(type){this.listeners[type]?.();}};
const urlObject={createObjectURL(){return 'blob:test-url';},revokeObjectURL(){}};
function Option(name,value){const e=new Element('option');e.textContent=name;e.value=value;return e;}
const sandbox={document,window,location,history,localStorage,navigator,URL:urlObject,Option,Blob,crypto:{randomUUID:()=>Math.random().toString(36)},confirm:()=>true,setTimeout:()=>{}};
vm.runInNewContext(js,sandbox,{filename:'app.js'});
test('Inicializa seis testes de navegador',()=>assert.equal(elements['audit-rows'].children.length,6));
test('Troca de rota e estado de navegação',()=>{location.hash='#listas';window.emit('hashchange');assert.equal(elements.listas.hidden,false);assert.equal(elements.visao.hidden,true);assert.equal(elements['section-heading'].textContent,'Criar listas');assert.equal(navs[3].attrs['aria-current'],'page');});
elements['item-name'].value='ITEM REAL';elements['item-quantity'].value='25G';elements['item-price'].value='R$55';
elements['item-form'].emit('submit');
test('Cadastro e persistência de item sem inventar dados',()=>{const value=JSON.parse(local.get('tx26-central-lista-r1'));assert.equal(value.length,1);assert.equal(value[0].name,'ITEM REAL');assert.equal(value[0].quantity,'25G');assert.equal(value[0].price,'R$55');assert.equal(elements['list-items'].children.length,1);});
test('Arquivo de mídia é usado só no navegador',()=>{elements['media-input'].files=[{name:'arquivo.jpg',size:100,lastModified:12,type:'image/jpeg'}];elements['media-input'].emit('change');assert.equal(elements['media-gallery'].children.length,1);assert.equal(elements['media-count-home'].textContent,'1');});
elements['item-name'].value='<img src=x onerror=alert(1)>';elements['item-form'].emit('submit');
test('Entrada maliciosa permanece texto',()=>{const item=elements['list-items'].children[1];assert.equal(item.children[0].children[0].textContent,'<img src=x onerror=alert(1)>');assert.equal(item.children[0].children[0].tagName,'STRONG');});
elements['copy-list'].emit('click');
await new Promise(resolve=>setImmediate(resolve));
test('Cópia exporta preço fornecido e rodapé único',()=>{assert.ok(clipboardText.includes('ITEM REAL\n25G R$55'));assert.equal(clipboardText.split('Conferir materiais disponíveis no mesmo envio.').length-1,1);});
elements['check-whatsapp'].checked=true;elements['check-whatsapp'].emit('change');
test('Comprovação fica rotulada como manual',()=>assert.ok(elements['proof-updated'].textContent.includes('manual')));
test('Nenhum segredo enviado',()=>assert.doesNotMatch(js,/telegram\.sendData|postMessage\s*\(/));
console.log(JSON.stringify({pass:results.filter(x=>x.state==='PASS').length,fail:results.filter(x=>x.state==='FAIL').length}));
if(results.some(x=>x.state==='FAIL'))process.exitCode=1;