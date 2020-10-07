import {readFile, readFileSync, writeFileSync} from 'fs';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import download from 'image-downloader';

const getList = () => {
  return new Promise((resolve, reject) => {
    readFile('./public/list.json', 'utf8', (err, data) => {
      if(err) {
        reject(err);
      }else{
        resolve(JSON.parse(data)['case-studies']);
      }
    });
  })
}

const downloadImg = async (url) => {
    let arr = url.split('/');
    let brand = arr[arr.length-2];
    let name = arr[arr.length-1];
    let path  = await download.image({
        url: url,
        dest: `public/img/${brand}_${name}`
    });
    return 'https://ncs-node.herokuapp.com/'  + path.filename.replace('public', 'assets');
}

const getHtml = async (url) => {
  let html = await fetch(url).then(res => res.text());
  return html;
}

const parserHtml = async (address, html) => {
  console.log(`parser ${address}`)
  const root = parse(html);

  let clientLogo = '';
  let nitecoLogo = '';
  let logo = '';
  let responsiveLogo = '';
  
  let ipadElement = root.querySelector("#text1 img");
  let ipadSrc = ipadElement.getAttribute('src');
  let imageIpad = `${address}${ipadSrc}`;

  const img1Ids = root.querySelectorAll("#img1")
  for (let i=0; i<img1Ids.length; i++) {
    let src = img1Ids[i].getAttribute("src");
    if (src === 'client_logo.png' || src === 'client_logo_dark.png') {
      clientLogo = `${address}${src}`;
    } else if(src === 'niteco_logo.png'){
      nitecoLogo = `${address}${src}`;
    } else if(src === 'responsive.png'){
      responsiveLogo = `${address}${src}`;
    }
  }

  if (responsiveLogo === '') {
    let src = img1Ids[img1Ids.length-1].getAttribute("src");
    responsiveLogo = `${address}${src}`;
  }

  const imgLogo = root.querySelectorAll("img")
  for (let i=0; i<imgLogo.length; i++) {
    let src = imgLogo[i].getAttribute("src");
    if(src === 'logo.png'){
      logo = `${address}${src}`;
    }
  }

  let pTheBrief = '';
  let pSolution = '';
  let pTechnical = '';
  const content1Ids = root.querySelectorAll("#content1");
  for (let i=0; i<content1Ids.length; i++) {
    if (i===0) {
      let p = content1Ids[i].querySelector("p");
      pTheBrief = p.innerHTML;
    } else if(i===1){
      let p = content1Ids[i].querySelector("p");
      pSolution = p.innerHTML;
    } else if(i===2){
      let p = content1Ids[i].querySelectorAll("p");
      for (let j=0; j<p.length; j++) {
        pTechnical = `${pTechnical}${j!==0 ? ',': ''}${p[j].innerHTML}`
      }
    }
  }

  let logoPath = await downloadImg(logo);
  let s1 = {
    name: 'the brief',
    image: logoPath,
    description: pTheBrief
  }

  let imageIpadPath = await downloadImg(imageIpad);
  let s2 = {
    name: 'the solution',
    image: imageIpadPath,
    description: pSolution
  } 

  let responsiveLogoPath = await downloadImg(responsiveLogo);
  let s3 = {
    name: 'technical details',
    image: responsiveLogoPath,
    description: pTechnical
  }

  let clientLogoPath = await downloadImg(clientLogo);
  let nitecoLogoPath = await downloadImg(nitecoLogo);
  let result = {
    clientLogoPath,
    nitecoLogoPath,
    data: [s1, s2, s3]
  }

  return result;
}

export const craw = async () => {
  let list = await getList();
  let data = {};
  for (let i=0; i<list.length; i++) {
    let html = await getHtml(list[i].link);
    let htmlParser = await parserHtml(list[i].link, html)
    let id = list[i].id;
    data[id] = {...htmlParser}
  }
  writeFileSync('./public/data.json', JSON.stringify(data), 'utf-8');
  console.log('done');
}
