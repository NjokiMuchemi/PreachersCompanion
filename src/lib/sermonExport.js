import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

const safeName = (s) => (s || 'sermon').replace(/[\\/:*?"<>|]/g, '-');
const hex = (s, fallback='FFFFFF') => /^#[0-9a-f]{6}$/i.test(s || '') ? s.slice(1) : fallback;
const align = (a) => ({center:AlignmentType.CENTER,right:AlignmentType.RIGHT,justify:AlignmentType.JUSTIFIED})[a] || AlignmentType.LEFT;
const runFromNode = (n) => {
  const marks = n.marks || [];
  const has = (type) => marks.some(m=>m.type===type);
  const style = marks.find(m=>m.type==='textStyle')?.attrs || {};
  const size = parseFloat(style.fontSize);
  return new TextRun({text:n.text || '', bold:has('bold'),italics:has('italic'),underline:has('underline')?{}:undefined,strike:has('strike'),
    color:hex(style.color,'172033'),size:Number.isFinite(size)?Math.max(16,Math.min(80,Math.round(size*1.5))):24,
    font:style.fontFamily || 'Aptos',break:0});
};
const makeParagraphs = (node, opts={}) => {
  const children = node.content || [];
  if(node.type==='bulletList' || node.type==='orderedList') return children.flatMap((c,i)=>makeParagraphs(c,{...opts,list:node.type==='bulletList',number:i+1}));
  if(node.type==='listItem') return children.flatMap(c=>makeParagraphs(c,opts));
  if(node.type==='blockquote') return children.flatMap(c=>makeParagraphs(c,{...opts,quote:true}));
  if(node.type==='hardBreak') return [new Paragraph({text:''})];
  if(node.type==='image') return []; // Image export to Word needs separate binary handling.
  if(!['paragraph','heading'].includes(node.type)) return children.flatMap(c=>makeParagraphs(c,opts));
  const level = node.type==='heading' ? (node.attrs?.level || 2) : 0;
  const runs = children.flatMap(c=>c.type==='text'?[runFromNode(c)]:c.type==='hardBreak'?[new TextRun({text:'',break:1})]:[]);
  if(opts.list) runs.unshift(new TextRun({text:'•  ',color:'B77900'}));
  if(opts.number) runs.unshift(new TextRun({text:`${opts.number}.  `,color:'B77900'}));
  return [new Paragraph({children:runs.length?runs:[new TextRun('')],
    heading:level?({1:HeadingLevel.HEADING_1,2:HeadingLevel.HEADING_2,3:HeadingLevel.HEADING_3}[level] || HeadingLevel.HEADING_3):undefined,
    alignment:align(node.attrs?.textAlign),
    border:opts.quote?{left:{style:BorderStyle.SINGLE,size:18,color:'B77900',space:10}}:undefined,
    spacing:{before:level?240:0,after:level?180:100,line:330},
    indent:opts.quote?{left:280}:undefined
  })];
};
export async function exportSermonWord({editor,title,category,scripture}) {
  const heading = new Paragraph({children:[new TextRun({text:title||'Untitled Sermon',bold:true,color:'B77900',size:42})],alignment:AlignmentType.CENTER,spacing:{after:160}});
  const meta = new Paragraph({children:[new TextRun({text:`${category||''}${category&&scripture?'  •  ':''}${scripture||''}`,color:'475569',size:20})],alignment:AlignmentType.CENTER,spacing:{after:340}});
  const nodes = editor?.getJSON()?.content || [];
  const paragraphs = nodes.flatMap(n=>makeParagraphs(n));
  const doc = new Document({sections:[{properties:{page:{margin:{top:850,bottom:850,left:950,right:950}}},children:[heading,meta,...paragraphs]}],styles:{default:{document:{run:{font:'Aptos',size:24,color:'172033'}}},paragraphStyles:[
    {id:'Heading1',name:'Heading 1',basedOn:'Normal',run:{bold:true,color:'0F172A',size:36}},
    {id:'Heading2',name:'Heading 2',basedOn:'Normal',run:{bold:true,color:'B77900',size:30}},
    {id:'Heading3',name:'Heading 3',basedOn:'Normal',run:{bold:true,color:'0F172A',size:26}}
  ]}});
  saveAs(await Packer.toBlob(doc),`${safeName(title)}.docx`);
}
export async function exportSermonPDF({editor,title,category,scripture}) {
  // Render a dedicated export DOM, never the editor toolbar or its scroll container.
  const root = document.createElement('div');
  root.style.cssText='position:fixed;left:-12000px;top:0;width:794px;padding:62px 64px;background:#0f172a;color:#f8fafc;font:18px/1.65 Arial,sans-serif;box-sizing:border-box;overflow:visible;';
  const heading=document.createElement('h1');heading.textContent=title||'Untitled Sermon';heading.style.cssText='text-align:center;font-size:36px;line-height:1.2;margin:0 0 10px;color:#fff;';root.appendChild(heading);
  const meta=document.createElement('p');meta.textContent=[category,scripture].filter(Boolean).join('  •  ');meta.style.cssText='text-align:center;color:#fbbf24;margin:0 0 30px;font-weight:600;';root.appendChild(meta);
  const body=document.createElement('div');body.innerHTML=editor?.getHTML()||'';body.style.cssText='overflow-wrap:anywhere;';
  const style=document.createElement('style');style.textContent='h1,h2,h3{color:#fff;line-height:1.25;margin:24px 0 12px}h1{font-size:34px}h2{font-size:28px}h3{font-size:23px}p{margin:0 0 12px}blockquote{border-left:4px solid #fbbf24;padding-left:18px;margin:18px 0;color:#e2e8f0}ul,ol{padding-left:30px;margin:12px 0}li{margin:5px 0}img{max-width:100%;height:auto}hr{border:0;border-top:1px solid #64748b;margin:22px 0}';root.appendChild(style);root.appendChild(body);document.body.appendChild(root);
  try {
    await document.fonts?.ready;
    const canvas=await html2canvas(root,{backgroundColor:'#0f172a',scale:1.5,useCORS:true,logging:false,windowWidth:794});
    const pdf=new jsPDF({orientation:'portrait',unit:'pt',format:'a4'});
    const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
    const pxPerPage=Math.floor(canvas.width*ph/pw);
    let y=0,page=0;
    while(y<canvas.height){
      const h=Math.min(pxPerPage,canvas.height-y);
      const slice=document.createElement('canvas');slice.width=canvas.width;slice.height=h;
      slice.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
      if(page++)pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg',0.92),'JPEG',0,0,pw,h*pw/canvas.width);
      y+=h;
    }
    pdf.save(`${safeName(title)}.pdf`);
  } finally {root.remove();}
}


// Editable PowerPoint slides, built from TipTap document structure.
// Separate from PDF export so the existing PDF output remains unchanged.
export async function exportSermonPowerPoint({editor,title,category,scripture}) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Preacher’s Companion';
  pptx.subject = 'Sermon presentation';
  pptx.title = title || 'Sermon';
  pptx.lang = 'en-KE';
  const NAVY='0F172A', AMBER='FBBF24', WHITE='FFFFFF', LIGHT='CBD5E1';
  const W=13.333, H=7.5;
  const safeText = value => String(value || '').replace(/\s+/g,' ').trim();
  const textOf = node => (node?.text || '') + (node?.content || []).map(textOf).join(node?.type==='paragraph'?'':'');
  const blocks=[];
  function visit(node) {
    if (!node) return;
    if (node.type==='heading') { blocks.push({type:'heading',text:safeText(textOf(node))}); return; }
    if (node.type==='paragraph') { const t=safeText(textOf(node)); if(t) blocks.push({type:'body',text:t}); return; }
    if (node.type==='blockquote') { blocks.push({type:'quote',text:safeText(textOf(node))}); return; }
    if (node.type==='bulletList'||node.type==='orderedList') {
      (node.content||[]).forEach((item,i)=>{const t=safeText(textOf(item));if(t)blocks.push({type:'body',text:(node.type==='orderedList'?`${i+1}. `:'• ')+t});}); return;
    }
    (node.content||[]).forEach(visit);
  }
  (editor?.getJSON()?.content||[]).forEach(visit);
  function baseSlide() {
    const slide=pptx.addSlide(); slide.background={color:NAVY};
    slide.addShape(pptx.ShapeType.line,{x:0.7,y:6.95,w:11.95,h:0,line:{color:'334155',width:1}});
    slide.addText('PREACHER’S COMPANION',{x:0.72,y:7.04,w:8,h:0.22,fontFace:'Aptos',fontSize:9,bold:true,color:AMBER,margin:0});
    slide.addText(String(pptx._slides.length),{x:12,y:7.02,w:0.55,h:0.25,fontSize:9,color:LIGHT,align:'right',margin:0});
    return slide;
  }
  const cover=baseSlide();
  cover.addText(title||'Untitled Sermon',{x:0.9,y:2.05,w:11.5,h:1.55,fontFace:'Aptos Display',fontSize:42,bold:true,color:WHITE,align:'center',breakLine:false,margin:0,fit:'shrink'});
  cover.addText([category,scripture].filter(Boolean).join('  •  '),{x:1,y:3.95,w:11.3,h:0.65,fontSize:22,bold:true,color:AMBER,align:'center',margin:0,fit:'shrink'});
  // Content slides: no fixed page count; split long paragraphs across slides.
  let slide=null, y=0, section='SERMON NOTES';
  const newSlide=()=>{slide=baseSlide();y=1.42;slide.addText(section,{x:0.72,y:0.48,w:11.9,h:0.67,fontFace:'Aptos Display',fontSize:29,bold:true,color:WHITE,margin:0,fit:'shrink'});};
  const wrap=(text,max=72)=>{
    const words=text.split(/\s+/),lines=[];let line='';
    for(const word of words){if((line+' '+word).trim().length>max && line){lines.push(line);line=word;}else line=(line+' '+word).trim();}
    if(line)lines.push(line);return lines;
  };
  for(const b of blocks){
    if(b.type==='heading'){section=b.text || 'SERMON NOTES';slide=null;continue;}
    const lines=wrap(b.text,b.type==='quote'?66:76);
    // Group up to 5 lines per text box, allowing paragraph continuation.
    for(let i=0;i<lines.length;i+=5){
      const piece=lines.slice(i,i+5).join('\n');
      const count=lines.slice(i,i+5).length;
      const height=count*0.43+0.22;
      if(!slide||y+height>6.65)newSlide();
      if(b.type==='quote')slide.addShape(pptx.ShapeType.rect,{x:0.76,y:y+0.02,w:0.055,h:height-0.08,line:{color:AMBER,transparency:100},fill:{color:AMBER}});
      slide.addText(piece,{x:b.type==='quote'?1.05:0.84,y,w:b.type==='quote'?11.35:11.55,h:height,fontFace:'Aptos',fontSize:b.type==='quote'?20:21,color:b.type==='quote'?AMBER:LIGHT,italic:b.type==='quote',margin:0,breakLine:false,valign:'top',fit:'shrink'});
      y+=height+0.18;
    }
  }
  await pptx.writeFile({fileName:`${safeName(title)}.pptx`});
}
