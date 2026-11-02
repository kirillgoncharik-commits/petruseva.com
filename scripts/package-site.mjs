import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const dist=join(root,'dist');
rmSync(dist,{recursive:true,force:true});mkdirSync(dist);
// Publish only visitor-facing files. Author sources and internal notes stay in Git.
for(const name of readdirSync(root)) {
 if(name==='assets')cpSync(join(root,name),join(dist,name),{recursive:true});
 else if(/\.(?:html|webp|jpg|png|svg|ico|xml|txt)$/.test(name)&&statSync(join(root,name)).isFile()) cpSync(join(root,name),join(dist,name));
 else if(!name.startsWith('.')&&statSync(join(root,name)).isDirectory()&&readdirSync(join(root,name)).includes('index.html')) cpSync(join(root,name,'index.html'),join(dist,name,'index.html'));
}
console.log('Deployment directory prepared without source content, documentation or Git files.');
