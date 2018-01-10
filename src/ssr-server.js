import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PayPalPayment from './utils/PayPalPayment';
import CurrencyLayer from './utils/CurrencyLayer';
import Shipping from './utils/Shipping';
import Sendmail from './utils/Sendmail';
import Home from './pages/Home/Home';
import Credit from './pages/Credit/Credit';
import { logs as log } from './utils/logutils';

const app = express();
const router = express.Router();

dotenv.config()
const http_host = process.env.API_HOST || '127.0.0.1';
const http_port = process.env.API_PORT || 8080;
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

const env = process.env.NODE_ENV || 'development';
if (env === 'development') 
  log.config('console', 'color', 'webpay-api', 'TRACE');
if (env === 'staging') 
  log.config('file', 'basic', 'webpay-api', 'DEBUG');
if (env === 'production') 
  log.config('file', 'json', 'webpay-api', 'INFO');

const pspid = 'ssr-server';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(log.connect());

router.route('/')
.get((req, res, next)     => {
  const { language, length, weight, from, usd, jpy } = req.query;
  res.send('<!doctype html>\n'
    + ReactDOMServer.renderToStaticMarkup(<Home
    language={language}
    length={length}
    weight={weight}
    from={from}
    usd={usd}
    jpy={jpy} />));
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/credit')
.get((req, res, next)     => {
  const { language, options } = req.query;
  res.send('<!doctype html>\n'
    + ReactDOMServer.renderToStaticMarkup(<Credit options={options} />));
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
    , err => {
      res.json({ error: { name: err.name, message: err.message } });
      log.error(err.name, err.message);
    }
    , ()  => { log.info('Completed to create payment.'); }
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
    , err => {
      res.json({ error: { name: err.name, message: err.message } });
      log.error(err.name, err.message);
    }
    , ()  => { log.info('Completed to execute payment.'); }
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
    , err => {
      res.json({ error: { name: err.name, message: err.message } });
      log.error(err.name, err.message);
    }
    , ()  => { log.info('Completed to create message.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/shipping')
.get((req, res, next)     => {
  const { length, weight, from } = req.query;
  Shipping.of({ length, weight, from }).fetchShipping()
  .subscribe(
    data  => { res.json(data); }
    , err => {
      res.json({ error: { name: err.name, message: err.message } });
      log.error(err.name, err.message);
    }
    , ()  => { log.info('Completed to response shipping.'); }
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
    , err => {
      res.json({ error: { name: err.name, message: err.message } });
      log.error(err.name, err.message);
    }
    , ()  => { log.info('Completed to responce currency.'); }
  );
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

app.use('/api', router);
http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
