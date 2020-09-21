import express from 'express';
import {readFileSync} from 'fs';

const app = express();

app.use('/', (req, res, next) => {
  next();
});

app.get('/article', (req, res) => {
  let listData = readFileSync('list.json', 'utf8');
  res.send(listData);
});

app.get('/article/:id', (req, res) => {
  let data = readFileSync('data.json', 'utf8');
  res.send(JSON.parse(data)[req.params.id]);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Example app listening on port 3000');
});
