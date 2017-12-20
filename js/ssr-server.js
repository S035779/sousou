import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import PayPalPayment from './utils/PayPalPayment';
import CurrencyLayer from './utils/CurrencyLayer';
import Shipping from './utils/Shipping';
import Sendmail from './utils/Sendmail';
import { logs as log } from './utils/logutils';

const app = express();
const router = express.Router();

dotenv.config()
const port = process.env.SSR_PORT || 8080
const options = {
  key: fs.readFileSync(__dirname + '/../ssl/server.key')
  , cert: fs.readFileSync(__dirname + '/../ssl/server.crt')
};
const paypal_keyset = {
  access_key:         process.env.PAYPAL_ACCESS_KEY
  , secret_key:       process.env.PAYPAL_SECRET_KEY
};
const currency_keyset = {
  access_key:         process.env.CURRENCY_ACCESS_KEY
};
const mail_keyset = {
  host:     process.env.SENDMAIL_HOST
  , secure: process.env.SENDMAIL_SSL
  , port:   process.env.SENDMAIL_PORT
  , auth: {
    user:   process.env.SENDMAIL_USER
    , pass: process.env.SENDMAIL_PASS
  }
};

log.config('console', 'color', 'webpay-app', 'ALL');
const pspid = 'ssr-server';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(log.connect());

router.use((req, res, next) => {
  log.trace(`${pspid}>`, req.method, req.url, req.path);
  next();
});

router.route('/payment/create-payment')
.get((req, res, next)     => { next(new Error('not implemented')); })
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => {
  PayPalPayment.of(paypal_keyset).createPayment()
  .subscribe(
    data  => { res.json({ id: data.id }); }
    , err => { log.error(`${pspid}>`, err.message); }
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
    , err => { log.error(`${pspid}>`, err.message); }
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
    //, err => { log.error(`${pspid}>`, err.message); }
    //, ()  => { log.info(`${pspid}>`, 'Completed to create message.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/shipping')
.get((req, res, next)     => {
  const { length, weight, from } = req.query;
  Shipping.of({ length, weight, from }).fetchShipping()
  .subscribe(
    data  => { res.json(data); }
    , err => { log.error(`${pspid}>`, err.message); }
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
    , err => { log.error(`${pspid}>`, err.message); }
    , ()  => { log.info(`${pspid}>`, 'Completed to responce currency.'); }
  );
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

app.use('/api', router);
http.createServer(app).listen(port, () => {
  log.info(`${pspid}>`, 'HTTP Server listening on localhost:', port);
});
