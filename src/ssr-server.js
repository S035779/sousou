import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
//import { renderRoutes } from 'react-router-config';
//import getRoutes from './routes';
import { dehydrateState, createStores } from './stores';
import { createDispatcher } from './dispatcher';
import PayPalPayment from './utils/PayPalPayment';
import CurrencyLayer from './utils/CurrencyLayer';
import Shipping from './utils/Shipping';
import Sendmail from './utils/Sendmail';
import { logs as log } from './utils/logutils';

import Html from './pages/Html/Html';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_host = process.env.API_HOST || '127.0.0.1';
const http_port = process.env.API_PORT || 8080;
const smtp_port = process.env.MMS_PORT || 2525;
const ssmtp_port = process.env.MMS_SSL;
const paypal_keyset = {
  access_key:         process.env.PAYPAL_ACCESS_KEY
  , secret_key:       process.env.PAYPAL_SECRET_KEY
};
const currency_keyset = {
  access_key:         process.env.CURRENCY_ACCESS_KEY
};
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

if (env === 'development') {
  log.config('console', 'color', 'webpay-api', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'webpay-api', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'webpay-api', 'INFO');
}
const pspid = 'ssr-server';

const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(log.connect());

router.route('/')
.get((req, res, next)     => {
  createStores(createDispatcher());
  const initialStat = JSON.stringify(dehydrateState());
  const initialData = JSON.stringify(req.query);
  res.send('<!doctype html>\n' + renderToStaticMarkup(
    <Html initialStat={initialStat} initialData={initialData}/>
  ));
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/payment/credit')
.get((req, res, next)    => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)     => {
  log.info("Payment Event Received.");
  log.info('Verifying Pay:', req.body);
  const { credit_validate } = req.body;
  PayPalPayment.of(paypal_keyset).validateCredit(credit_validate)
  .subscribe(
    data  => {  res.json(data); }
    , err => {
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
     }
    , ()  => { log.info('Completed to validate credit payment.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/payment/notify')
.get((req, res, next)     => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => {
  log.info("IPN Notification Event Received.");
  res.sendStatus(200);
  log.info('Verifying IPN:', req.body);
  PayPalPayment.of(paypal_keyset).validateNotification(req.body)
  .subscribe(
    data  => { log.info('Verified IPN:', data); }
    , err => {
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
    }
    , ()  => { log.info('Completed to validate notification.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/payment/create-payment')
.get((req, res, next)     => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => {
  PayPalPayment.of(paypal_keyset).createExpress()
  .subscribe(
    data  => { res.json({ id: data.id }); }
    , err => {
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
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
  PayPalPayment.of(paypal_keyset).executeExpress({ paymentID, payerID })
  .subscribe(
    data  => { res.json({ data }); }
    , err => {
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
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
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
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
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
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
      res.status(500)
        .send({ error: { name: err.name, message: err.message } });
      log.error(err.name, ':', err.message);
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
