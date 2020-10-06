import express from 'express';
import ejs from 'ejs';
import {readFileSync} from 'fs';
import {craw} from './app'
import cors from 'cors';

const app = express();
app.use(cors())
app.use('/assets', express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

app.use('/', (req, res, next) => {
  console.log('[REQUEST]', req.url);
  next();
});

app.get('/craw', (req, res) => {
  craw();
  res.render('craw');
})


app.get('/article_list', (req, res) => {
  let listData = readFileSync('./public/list.json', 'utf8');
  res.send(listData);
});

app.get('/article_data', (req, res) => {
  let data = readFileSync('./public/data.json', 'utf8');
  res.send(data);
});

app.get('/article/:id', (req, res) => {
  let data = readFileSync('data.json', 'utf8');
  res.send(JSON.parse(data)[req.params.id]);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Example app listening on port 5000');
});
