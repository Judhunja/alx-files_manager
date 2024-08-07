const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || '5000';

const routes = require('./routes/index');

app.use(bodyParser.json());

app.use('/', routes);

app.listen(port, () => {
});

module.exports = app;
