require('dotenv').config()
import express from 'express';
import bodyParser from 'body-parser';
import PayPalPayment from './utils/PayPalPayment';
import CurrencyLayer from './utils/CurrencyLayer';
import Shipping from './utils/Shipping';
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
    , err => { log.error(`${pspid}>`, err); }
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
    , err => { log.error(`${pspid}>`, err); }
    , ()  => { log.info(`${pspid}>`, 'Completed to execute payment.'); }
  );
})
.delete((req, res, next)  => { next(new Error('not implemented')); });

router.route('/shipping')
.get((req, res, next)     => {
  const { length, weight, from } = req.query;
  Shipping.of({ length, weight, from }).fetchShipping()
  .subscribe(
    data  => { res.json(data); }
    , err => { log.error(`${pspid}>`, err); }
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
    , err => { log.error(`${pspid}>`, err); }
    , ()  => { log.info(`${pspid}>`, 'Completed to responce currency.'); }
  );
})
.put((req, res, next)     => { next(new Error('not implemented')); })
.post((req, res, next)    => { next(new Error('not implemented')); })
.delete((req, res, next)  => { next(new Error('not implemented')); });

app.use('/api', router);
app.listen(port);
