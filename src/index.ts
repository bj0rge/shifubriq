import * as express from 'express';
import * as bodyParser from 'body-parser';
import Config from './config';

import { buildApiRouter } from './routers';

const app = express();

// APP LAUNCH
var server = app.listen(Config.env.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
app.use(bodyParser.urlencoded({ extended: false }));

// API
app.use('/api', buildApiRouter());
