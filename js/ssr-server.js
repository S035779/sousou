import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import serveStatic from 'serve-static';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PayPalPayment from './utils/PayPalPayment';
import CurrencyLayer from './utils/CurrencyLayer';
import Shipping from './utils/Shipping';
import Sendmail from './utils/Sendmail';
import Home from './pages/Home/Home';
import { logs as log } from './utils/logutils';

const app = express();
const router = express.Router();

dotenv.config()
const http_port = process.env.SSR_PORT || 8080;
const https_port = process.env.SSR_SSL || 4443;
const ssl_keyset = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/server.key'))
  , cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
};
const paypal_keyset = {
  access_key:         process.env.PAYPAL_ACCESS_KEY
  , secret_key:       process.env.PAYPAL_SECRET_KEY
};
const currency_keyset = {
  access_key:         process.env.CURRENCY_ACCESS_KEY
};
const smtp_port = process.env.MMS_PORT || 2525;
const ssmtp_port = process.env.MMS_SSL;
const isSSL = ssmtp_port ? true : false;
const mail_keyset = {
  host:     process.env.MMS_HOST
  , secure: isSSL
  , port:   isSSL ? ssmtp_port : smtp_port
  , auth: {
    user:   process.env.MMS_USER
    , pass: process.env.MMS_PASS
  }
};

log.config('console', 'color', 'webpay-app', 'ALL');
const pspid = 'ssr-server';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(log.connect());
app.use('/api', serveStatic(path.join(__dirname, '../public')));

router.use((req, res, next) => {
  log.trace(`${pspid}>`, req.method, req.url, req.path);
  next();
});

router.route('/')
.get((req, res, next)     => {
  const { language } = req.query;
  res.send('<!doctype html>\n'
    + ReactDOMServer.renderToStaticMarkup(<Home language={language} />));
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/payment/create-payment')
.get((req, res, next)     => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => {
  PayPalPayment.of(paypal_keyset).createPayment()
  .subscribe(
    data  => { res.json({ id: data.id }); }
    , err => { log.error(`${pspid}>`, err.name, err.message); }
    , ()  => { log.info(`${pspid}>`, 'Completed to create payment.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/payment/execute-payment')
.get((req, res, next)     => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => {
  const { paymentID, payerID } = req.body;
  PayPalPayment.of(paypal_keyset).executePayment({ paymentID, payerID })
  .subscribe(
    data  => { res.json({ data }); }
    , err => { log.error(`${pspid}>`, err.name, err.message); }
    , ()  => { log.info(`${pspid}>`, 'Completed to execute payment.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/sendmail')
.get((req, res, next)     => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => {
  const { message } = req.body;
  Sendmail.of(mail_keyset).createMessage(message)
  .subscribe(
    data  => { res.json(data); }
    , err => { log.error(`${pspid}>`, err.name, err.message); }
    , ()  => { log.info(`${pspid}>`, 'Completed to create message.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/shipping')
.get((req, res, next)     => {
  const { length, weight, from } = req.query;
  Shipping.of({ length, weight, from }).fetchShipping()
  .subscribe(
    data  => { res.json(data); }
    , err => { log.error(`${pspid}>`, err.name, err.message); }
    , ()  => { log.info(`${pspid}>`, 'Completed to response shipping.'); }
  );
})
.post((req, res, next)    => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/currency')
.get((req, res) => {
  const { usd, jpy } = req.query;
  CurrencyLayer.of(currency_keyset).fetchCurrency({ usd, jpy })
  .subscribe(
    data  => { res.json(data); }
    , err => { log.error(`${pspid}>`, err.name, err.message); }
    , ()  => { log.info(`${pspid}>`, 'Completed to responce currency.'); }
  );
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

app.use('/api', router);
http.createServer(app).listen(http_port, () => {
  log.info(`${pspid}>`
    , `HTTP Server listening on 127.0.0.1:${http_port}`);
});
https.createServer(ssl_keyset, app).listen(https_port, () => {
  log.info(`${pspid}>`
    , `Secure HTTP Server listening on 127.0.0.1:${https_port}`);
});
