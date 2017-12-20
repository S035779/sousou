import dotenv from 'dotenv';
import { SMTPServer } from 'smtp-server';
import { logs as log } from './utils/logutils';

dotenv.config();
const port = process.env.SENDMAIL_PORT;
const user = process.env.SENDMAIL_USER;
const pass = process.env.SENDMAIL_PASS;
const host = 'localhost';

const options = {
  logger: true,
  banner: 'Welcome to My Awesome SMTP Server',
  disabledCommands: ['AUTH', 'STARTTLS'],
  authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],
  size: 10 * 1024 * 1024,
  useXClient: true,
  hidePIPELINING: true,
  onAuth(auth, session, callback) {
    if ((auth.username === user && auth.password === pass) ||
      (auth.username === user
        && auth.method === 'CRAM-MD5' && auth.valicatePassword(pass))) {
      return callback(null, { user: 'userdata' });
    }
    callback(new Error('Authentication failed'));
  },
  onMailFrom(address, session, callback) {
    if (/^deny/i.test(address.address))
      return callback(new Error('Not accepted'));
    callback();
  },
  onRcptTo(address, session, callback) {
    let err;
    if (/^deny/i.test(address.address)) {
      return callback(new Error('Not accepted'));
    }
    if (address.address.toLowerCase() === 'almost-full@example.com'
      && Number(session.envelope.mailFrom.args.SIZE) > 100) {
      err = new Error('Insufficient channel storage: ' + address.address);
      err.responseCode = 452;
      return callback(err);
    }
    callback();
  },
  onData(stream, session, callback) {
    stream.pipe(process.stdout);
    stream.on('end', () => {
      let err;
      if (stream.sizeExceeded) {
        err = new Error(
          'Error: message exceeds fixed maximum message size 10MB');
        err.responceCode = 552;
        return callback(err);
      }
      callback(null, 'Message queued as abcdef');
    });
  },
};
const server = new SMTPServer(options);

server.on('error', err => { log.error(`${pspid}>`, err.message); });
server.listen(port, host);
