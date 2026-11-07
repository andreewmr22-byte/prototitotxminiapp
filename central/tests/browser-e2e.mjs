import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
const reports=[];
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(repo,'.'+p,(p.endsWith('/')?'index.html':''));
  if(!file.startsWith(repo+path.sep)){res.writeHead(403);res.end();return;}
  try{const content=await readFile(file);res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(content);}
  catch{res.writeHead(404);res.end('Não encontrado');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
let browser;let temp;
const run=async(name,fn)=>{try{await fn();reports.push([name,'PASS']);console.log('PASS',name);}catch(err){reports.push([name,'FAIL']);console.error('FAIL',name,err.message);}};
try{
  browser=await chromium.launch({headless:true});
  temp=await mkdtemp(path.join(tmpdir(),'tx26-'));
  const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto(`${url}/central/`);
  await run('Central abre sem erro',async()=>assert.equal(await page.title(),'TX 26 | Central'));
  await run('Seis rotas navegáveis',async()=>{
    for(const id of ['visao','whatsapp','acervo','listas','frentes','auditoria']){
      await page.locator(`nav [data-route="${id}"]`).click();
      await page.locator(`#${id}`).waitFor({state:'visible',timeout:5000});
      assert.equal(await page.locator('nav [aria-current="page"]').count(),1);
    }
  });
  await run('Links originais respondem',async()=>{
    for(const p of ['/index.html','/demos/7tx-laboratorio-chat-miniapp-r6.html','/tx-media-r2/index.html']){
      const response=await page.request.get(url+p);assert.equal(response.status(),200,p);
    }
  });
  await run('WhatsApp usa aba oficial segura',async()=>{
    const a=page.locator('#whatsapp a[href="https://web.whatsapp.com/"]');assert.equal(await a.getAttribute('target'),'_blank');
    assert.ok((await a.getAttribute('rel')).includes('noopener'));
  });
  await page.locator('nav [data-route="listas"]').click();
  await run('Formulário salva dados reais',async()=>{
    await page.locator('#item-name').fill('ITEM DE PROVA');
    await page.locator('#item-quantity').fill('10G');
    await page.locator('#item-price').fill('R$70');
    await page.locator('#item-form [type="submit"]').click();
    assert.equal(await page.locator('#list-items .item').count(),1);
    await page.reload();await page.locator('nav [data-route="listas"]').click();
    assert.ok((await page.locator('#list-items').innerText()).includes('ITEM DE PROVA'));
  });
  await run('Exporta lista TXT preservando valores',async()=>{
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export-list').click()]);
    assert.equal(download.suggestedFilename(),'tx26-lista.txt');
    const bytes=await readFile(await download.path(),'utf8');
    assert.ok(bytes.includes('ITEM DE PROVA\n10G R$70'));
    assert.equal((bytes.match(/Conferir materiais disponíveis no mesmo envio\./g)||[]).length,1);
  });
  await run('Entrada HTML é mantida como texto',async()=>{
    await page.locator('#item-name').fill('<img src=x onerror=alert(1)>');
    await page.locator('#item-form [type="submit"]').click();
    assert.equal(await page.locator('#list-items img').count(),0);
    assert.ok((await page.locator('#list-items').innerText()).includes('<img src=x'));
  });
  await page.locator('nav [data-route="acervo"]').click();
  await run('Importa e remove arquivo local',async()=>{
    await page.locator('#media-input').setInputFiles({name:'prova.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4//8/AwAI/AL+1hi0XQAAAABJRU5ErkJggg==','base64')});
    assert.equal(await page.locator('#media-gallery .media-item').count(),1);
    await page.locator('[data-remove-media]').click();
    assert.equal(await page.locator('#media-gallery .media-item').count(),0);
  });
  await page.locator('nav [data-route="auditoria"]').click();
  await run('Auditoria local exibe seis verificações',async()=>assert.equal(await page.locator('#audit-rows .audit-row').count(),6));
  for(const width of [320,390,430,768,1024,1440]){
    await run(`Layout sem overflow a ${width}px`,async()=>{
      await page.setViewportSize({width,height:850});await page.goto(`${url}/central/#visao`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false);
      if(width===390)await page.screenshot({path:path.join(temp,'tx26-mobile.png'),fullPage:true});
    });
  }
  await run('Nenhum erro JavaScript',async()=>assert.deepEqual(pageErrors,[]));
  await page.close();
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));if(temp)await rm(temp,{recursive:true,force:true});}
const failures=reports.filter(x=>x[1]==='FAIL');
console.log(`Resultado Chromium: ${reports.length-failures.length}/${reports.length} PASS`);
if(failures.length)process.exitCode=1;