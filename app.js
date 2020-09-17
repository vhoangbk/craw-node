import {readFile, readFileSync, writeFileSync} from 'fs';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

// const Slide = {
//   name: '',
//   image: '',
//   description: ''
// }

// const Detail = {
//   clientLogo: '',
//   data: []
// }

const getList = () => {
  return new Promise((resolve, reject) => {
    readFile('list.json', 'utf8', (err, data) => {
      if(err) {
        reject(err);
      }else{
        resolve(JSON.parse(data)['case-studies']);
      }
    });
  })
}

const getHtml = async (url) => {
  let html = await fetch(url).then(res => res.text());
  return html;
}

const parserHtml = (address, html) => {
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

  let s1 = {
    name: 'the brief',
    image: logo,
    description: pTheBrief
  }

  let s2 = {
    name: 'the solution',
    image: imageIpad,
    description: pSolution
  } 

  let s3 = {
    name: 'technical details',
    image: responsiveLogo,
    description: pTechnical
  }

  let result = {
    clientLogo,
    nitecoLogo,
    data: [s1, s2, s3]
  }

  return result;
}

const main = async () => {
  let list = await getList();
  let data = {};
  for (let i=0; i<list.length; i++) {
    let html = await getHtml(list[i].link);
    let htmlParser = parserHtml(list[i].link, html)
    let id = list[i].id;
    data[id] = {...htmlParser}
  }
  // console.log(JSON.stringify(data));
  writeFileSync('data.json', JSON.stringify(data), 'utf-8');
}

main();