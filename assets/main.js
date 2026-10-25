document.addEventListener('DOMContentLoaded',()=>{
 const motionAllowed=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.body.classList.add('js-ready');if(motionAllowed)document.body.classList.add('js-motion');
 const hero=document.querySelector('.cinematic'),heroPicture=hero.querySelector('.hero-photo');
 const bar=document.querySelector('.mobile-book');if('ResizeObserver'in window)new ResizeObserver(()=>document.documentElement.style.setProperty('--booking-height',Math.ceil(bar.getBoundingClientRect().height)+'px')).observe(bar);

 const data=JSON.parse(document.getElementById('gallery-data').textContent),dialog=document.querySelector('.lightbox');let current=0,opener=null;
 function display(n){current=(n+data.length)%data.length;const d=data[current];dialog.querySelector('img').src=d.src;dialog.querySelector('img').alt=d.alt;if(motionAllowed)dialog.querySelector('img').animate([{opacity:.15,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:360,easing:'ease-out'});dialog.querySelector('.photo-caption').textContent=d.alt;dialog.querySelector('.photo-counter').textContent=String(current+1).padStart(2,'0')+' / '+data.length;}
 document.querySelectorAll('[data-open-gallery]').forEach(b=>b.addEventListener('click',()=>{opener=b;display(Number(b.dataset.openGallery));dialog.showModal();}));
 dialog.querySelector('.close-gallery').addEventListener('click',()=>dialog.close());dialog.querySelector('.prev').addEventListener('click',()=>display(current-1));dialog.querySelector('.next').addEventListener('click',()=>display(current+1));dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();display(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();display(current-1)}});dialog.addEventListener('close',()=>opener?.focus());
 let startX=0;dialog.querySelector('img').addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});dialog.querySelector('img').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)display(current+(dx<0?1:-1))},{passive:true});
 const tablist=document.querySelector('.space-tabs');if(tablist){const nums=[0,1,2,3,4,5],stage=document.querySelector('.stage');stage.id='explorer-panel';stage.setAttribute('role','tabpanel');const image=stage.querySelector('img');let selected=0;
 function choose(i,focus=false){selected=i;const d=data[nums[i]];stage.querySelector('source')?.remove();image.src=d.src;image.alt=d.alt;const caption=document.querySelector('.space-caption');if(caption)caption.textContent=d.alt;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)image.animate([{opacity:.25,transform:'translateX(28px) scale(1.025)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:650,easing:'cubic-bezier(.16,.8,.25,1)'});stage.querySelector('[data-open-gallery]').dataset.openGallery=nums[i];stage.querySelector('.stage-count').textContent=String(i+1).padStart(2,'0')+' / 06';stage.setAttribute('aria-labelledby','space-tab-'+i);tablist.querySelectorAll('button').forEach((b,k)=>{b.setAttribute('aria-selected',String(i===k));b.tabIndex=i===k?0:-1});if(focus)tablist.children[i].focus();}
 nums.forEach((n,i)=>{const b=document.createElement('button');b.id='space-tab-'+i;b.className='space-tab';b.setAttribute('role','tab');b.setAttribute('aria-controls','explorer-panel');b.setAttribute('aria-label',data[n].alt);const thumb=document.createElement('img');thumb.src=data[n].thumb||data[n].src;thumb.alt='';thumb.loading='lazy';b.dataset.number=String(i+1).padStart(2,'0');b.append(thumb);b.addEventListener('click',()=>choose(i));b.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();choose(e.key==='Home'?0:e.key==='End'?5:(selected+(e.key==='ArrowRight'?1:5))%6,true)}});tablist.append(b)});choose(0);
 let stageX=0;image.addEventListener('touchstart',e=>{stageX=e.changedTouches[0].clientX},{passive:true});image.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-stageX;if(Math.abs(dx)>45)choose((selected+(dx<0?1:5))%6)},{passive:true});
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced&&'IntersectionObserver'in window){const ob=new IntersectionObserver(items=>items.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in-view');ob.unobserve(x.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>ob.observe(el));}
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-booking]');if(a)document.dispatchEvent(new CustomEvent('booking_click',{detail:{placement:a.dataset.booking,language:document.documentElement.lang,destination:'airbnb',listing_id:'1455066495407495959'}}))});
});
// Scroll-linked opening; once fully revealed, keep the room visible until page reload.
document.addEventListener('DOMContentLoaded',()=>{
 const media=document.querySelector('.cinematic .hero-media');if(!media)return;
 const mq=matchMedia('(prefers-reduced-motion: reduce)');
 const panels=document.createElement('div');panels.className='window-reveal';panels.setAttribute('aria-hidden','true');panels.innerHTML='<i></i><i></i><i></i>';
 const dim=document.createElement('div');dim.className='dim-layer';dim.setAttribute('aria-hidden','true');const light=document.createElement('div');light.className='light-bloom';light.setAttribute('aria-hidden','true');media.append(dim,light,panels);
 let parentOffset=0,frame=0,opened=false;const clamp=n=>Math.max(0,Math.min(1,n));
 function render(){frame=0;const mobile=innerWidth<=760;const range=mobile?90:300;let p=(!mobile||mq.matches)?1:clamp((scrollY+parentOffset)/range);if(p>=1)opened=true;if(opened)p=1;media.dataset.progress=p.toFixed(4);[...panels.children].forEach((el,i)=>el.style.transform=`translate3d(0,${-102*clamp(mobile?p:(p-i*.07)/.86)}%,0)`);dim.style.opacity=String(.12*(1-p));light.style.opacity=String(.09*Math.sin(p*Math.PI));panels.style.visibility=p>=1?'hidden':'visible';}
 const update=()=>{if(!frame)frame=requestAnimationFrame(render)};
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);mq.addEventListener('change',update);
 // Controlled embedding bridge. Only the parent window can supply host scroll.
 addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='frp-host-scroll'||!Number.isFinite(e.data.offset))return;parentOffset=Math.max(0,e.data.offset);update()});
 render();

});

// Header CTA appears only after the hero, so desktop never shows two booking buttons at once.
document.addEventListener('DOMContentLoaded',()=>{
 const hero=document.querySelector('.cinematic');if(!hero)return;
 const t=()=>{document.body.classList.toggle('past-hero',scrollY>hero.getBoundingClientRect().height*0.75)};
 addEventListener('scroll',t,{passive:true});t();
});
// Desktop booking access without a sticky header or changed anchor offsets.
document.addEventListener('DOMContentLoaded',()=>{
 const original=document.querySelector('.hero-summary .cta[data-booking]');if(!original)return;
 const dock=original.cloneNode(true);dock.classList.add('desktop-scroll-book');dock.dataset.booking='desktop-scroll';dock.hidden=true;const region=document.createElement('aside');region.setAttribute('aria-label','Airbnb');region.append(dock);document.body.append(region);
 const sync=()=>{dock.hidden=innerWidth<=760||original.getBoundingClientRect().bottom>0;if(dock.hidden)return;
 const box=dock.getBoundingClientRect(),pad=20;
 const obstacles=[...document.querySelectorAll('a,button,summary,.space-tabs')].filter(e=>e!==dock&&e.getClientRects().length).map(e=>e.getBoundingClientRect()).filter(r=>r.bottom>0&&r.top<innerHeight);
 const positions=[[innerWidth-box.width-pad,innerHeight-box.height-pad],[innerWidth-box.width-pad,pad],[pad,innerHeight-box.height-pad],[pad,pad]];
 const hit=([x,y])=>obstacles.some(r=>x<r.right+8&&x+box.width>r.left-8&&y<r.bottom+8&&y+box.height>r.top-8);
 const pos=positions.find(p=>!hit(p))||positions[0];dock.style.left=pos[0]+'px';dock.style.top=pos[1]+'px';dock.style.right='auto';dock.style.bottom='auto';};
 addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);sync();
});

// Native desktop photo control; reuse existing gallery/focus handling.
document.addEventListener('DOMContentLoaded',()=>{const media=document.querySelector('.cinematic .hero-media'),trigger=document.querySelector('.hero-gallery');if(!media||!trigger)return;const button=document.createElement('button');button.type='button';button.className='desktop-photo-open';button.setAttribute('aria-label',trigger.textContent.trim());button.setAttribute('aria-haspopup','dialog');media.append(button);button.addEventListener('click',()=>{trigger.click();document.querySelector('.lightbox').addEventListener('close',()=>button.focus(),{once:true})})});
