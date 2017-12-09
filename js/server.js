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

const pspid = 'ItemService';

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
  log.trace(`${pspid}>`, id, token );
  currency_keyset['token'] = token;
  CurrencyLayer.of(paypal_keyset).fetchCurrency(id)
  .subscribe(
    items   => { res.json(items); }
    , error => { log.error(`${pspid}>`, error); }
    , ()    => { log.info(`${pspid}>`, 'Completed'); }
  );
})
.put((req, res, next) => {
  next(new Error('not implemented'));
})
.post((req, res, next) => {
  next(new Error('not implemented'));
})
.delete((req, res, next) => {
  next(new Error('not implemented'));
});

router.route('/payment')
.get((req, res) => {
  const { id, token } = req.query;
  log.trace(`${pspid}>`, id, token );
  paypal_keyset['token'] = token;
  PayPalPayment.of(paypal_keyset).fetchPayment(id)
  .subscribe(
    items   => { res.json(items); }
    , error => { log.error(`${pspid}>`, error); }
    , ()    => { log.info(`${pspid}>`, 'Completed'); }
  );
})
.put((req, res, next) => {
  next(new Error('not implemented'));
})
.post((req, res, next) => {
  next(new Error('not implemented'));
})
.delete((req, res, next) => {
  next(new Error('not implemented'));
});

app.use('/api', router);
app.listen(port);
