require('dotenv').config()
import express from 'express';
import bodyParser from 'body-parser';
import PayPalPayment from './utils/PayPalPayment';
import CurrencyLayer from './utils/CurrencyLayer';
import { logs as log } from './utils/logutils';

const app = express();
const router = express.Router();
const port = process.env.PORT || 8081

const paypal_keyset = {
  access_key:   process.env.PAYPAL_ACCESS_KEY
  , secret_key: process.env.PAYPAL_SECRET_KEY
};
const currency_keyset = {
  access_key:   process.env.CURRENCY_ACCESS_KEY
  , secret_key: process.env.CURRENCY_SECRET_KEY
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

router.route('/currency')
.get((req, res) => {
  const { id, token } = req.query;
  currency_keyset['token'] = token;
  CurrencyLayer.of(paypal_keyset).fetchCurrency()
  .subscribe(
    data  => { res.json(data); }
    , err => { log.error(`${pspid}>`, err); }
    , ()  => { log.info(`${pspid}>`, 'Completed'); }
  );
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
    , err => { log.error(`${pspid}>`, err); }
    , ()  => { log.info(`${pspid}>`, 'Completed'); }
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
    , err => { log.error(`${pspid}>`, err); }
    , ()  => { log.info(`${pspid}>`, 'Completed'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

app.use('/api', router);
app.listen(port);
