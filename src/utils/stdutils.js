import querystring from 'querystring';
import crypto from 'crypto';
import { URL } from 'url';
import xml2js from 'xml2js';
import js2xml from 'xmlbuilder';

export default {
  is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  },
  /**
   * Copy the enumerable properties of p to o, and return o.
   * If o and p have a property by the same name, o's property is 
   * overwritten. This function does not handle getters and setters 
   * or copy attributes.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  extend(o, p) {
    for(let prop in p) {            // For all props in p.
      o[prop] = p[prop];        // Add the property to o.
    }
    return o;
  },

  /**
   * Copy the enumerable properties of p to o, and return o.
   * If o and p have a property by the same name, o's property is 
   * left alone. This function does not handle getters and setters 
   * or copy attributes.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  merge(o, p) {
    for(let  prop in p) {            // For all props in p.
      if (o.hasOwnProperty[prop]) continue;
                                // Except those already in o.
      o[prop] = p[prop];        // Add the property to o.
    }
    return o;
  },

  /**
   * Remove properties from o if there is not a property with the 
   * same name in p. Return o.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  restrict(o, p) {
    for(let prop in o) {            // For all props in o
      if (!(prop in p)) delete o[prop];
                                // Delete if not in p
    }
    return o;
  },

  /**
   * For each property of p, delete the property with the same name 
   * from o. Return o.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  subtract(o, p) {
    for(let prop in p) {            // For all props in p
      delete o[prop];           // Delete from o (deleting a
                                // nonexistent prop is harmless)
    }
    return o;
  },

  /**
   * Return a new object that holds the properties of both o and p.
   * If o and p have properties by the same name, the values 
   * from o are used.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  union(o,p) {
    return extend(extend({},o), p);
  },

  /**
   * Return a new object that holds only the properties of o that 
   * also appear in p. This is something like the intersection of o 
   * and p, but the values of the properties in p are discarded
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  intersection(o,p) { 
    return restrict(extend({}, o), p); 
  },

  /**
   * Return an array that holds the names of the enumerable own 
   * properties of o.
   *
   * @param {object} o
   * @returns {array}
   */
  keys(o) {
    if (typeof o !== "object") throw TypeError();
                                // Object argument required
    let result = [];            // The array we will return
    for(let prop in o) {        // For all enumerable properties
      if (o.hasOwnProperty(prop)) 
                                // If it is an own property
        result.push(prop);      // add it to the array.
    }
    return result;              // Return the array.
  },

  /**
   * and
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  and(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result = _o.concat(_p)
     .filter(function(x, i, y){ 
       return y.indexOf(x) !== y.lastIndexOf(x); })
     .filter(function(x, i, y){ 
       return y.indexOf(x) === i; });
    return result;
  },

  /**
   * del
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  del(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result =
     _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; });
    return result;
  },

  /**
   * add
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  add(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result =
     _p.filter(function(x, i, y) { return _o.indexOf(x) === -1; });
    return result;
  },

  /**
   * dif
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  dif(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result =
      _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; })
     .concat(
        _p.filter(function(x, i, y) { 
          return _o.indexOf(x) === -1; })
      );
    return result;
  },

  /**
   * dup
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  dup(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result = _o.concat(_p)
     .filter(function(x, i, y){ return y.indexOf(x) === i; });
    return result;
  },

  /**
   * dst.
   *
   * @param {array} o
   * @returns {array}
   */
  dst(o) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = _o.sort(function(s, t){
      const a=s.toString().toLowerCase();
      const b=t.toString().toLowerCase();
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
    const result = _p.filter(function(x, i, y) {
      if(i===0) return true;
      return x!==y[i-1];
    })
    return result;
  },

  /**
   * oder by string.
   *
   * @param {array} o
   * @returns {array}
   */
  sortStr(o) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(s, t){
      const a=s.toString().toLowerCase();
      const b=t.toString().toLowerCase();
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
  },

  /**
   * sort by number,
   *
   * @param {array} o
   * @returns {array}
   */
  sortNum(o) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(a, b){
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
  },

  /**
   * sort value by object key string,
   *
   * @param {array} o
   * @param {string} k
   * @returns {array}
   */
  sortObjStr(o, k) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(s, t){
      const a=s[k].toString().toLowerCase();
      const b=t[k].toString().toLowerCase();
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
  },

  /**
   * sort value by object key unicode.,
   *
   * @param {array} o
   * @param {string} k
   * @returns {array}
   */
  sortObjUni(o, k) {
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(s, t) {
      const a=s[k];
      const b=t[k];
      if(a<b) return -1;
      if(a>b) return 1;
    });
  },

  /**
   * getTimeStamp
   *
   * @returns {string}
   */
  getTimeStamp() {
    const dt = new Date();
    return dt.toISOString();
  },

  /**
   * getLocalTimeStamp
   *
   * @param {string} s
   * @returns {string}
   */
  getLocalTimeStamp(s) {
    const dt = new Date(s);
    const _yr = dt.getFullYear();
    const _mo = dt.getMonth() + 1;
    const _dy = dt.getDate();
    const _tm = dt.toTimeString().split(' ')[0];
    return `${_yr}-${_mo}-${_dy} ${_tm}`;
  },

  /**
   * getLocalDateStamp
   *
   * @param {string} s
   * @returns {string}
   */
  getLocalDateStamp(s) {
    const dt = new Date(s);
    const _mo = dt.getMonth() + 1;
    const _dy = dt.getDate();
    return `${_mo}/${_dy}`;
  },

  /**
   * Schedule an invocation or invovations of fn() in the future.
   * Note that the call to invoke() does not block: it returns 
   * right away.
   *
   * @param {function} fn - If interval is specified but end is 
   *                          omited, then never stop invoking fn.
   *                        If interval and end are omited, then 
   *                          just invoke fn once after start ms.
   *                        If only fn is specified, behave as is 
   *                          start was 0.
   * @param {number} s -  Wait start milliseconds, then call fn().
   * @param {number} i -  Call fn() every interval milliseconds.
   * @param {number} e -  Stopping after a total of start+end 
   *                      milliseconds.
   */
  invoke(fn, s, i, e) {
    if (!s) s = 0;
    setTimeout(fn, s);
    if (arguments.length >= 3) {
      setTimeout(function() {
        const h = setInterval(fn, i);
        if (e) setTimeout(function() { clearInterval(h); }, e);
      }, s);
    }
  },

  /**
   * Encode the properties of an object as if they were name/value 
   * pairs from an HTML form, 
   * using application/x-www-form-urlencoded format
   */
  encodeFormData(data) {
    if (!data) return "";
    let pairs = [];
    for(let name in data) {
      if (!data.hasOwnProperty(name)) continue;
      if (typeof data[name] === "function") continue;
      let value = data[name].toString();
      name = encodeURIComponent(name.replace(" ", "+"));
      value = encodeURIComponent(value.replace(" ", "+"));
      pairs.push(name + "=" + value);
    }
    return pairs.join('&');
  },

  /**
   * Decode an HTML form as if they were name/value pairs from 
   * the properties of an object, 
   * using application/x-www-form-urlencoded format↲
   */
  decodeFormData(text, sep, eq, isDecode) {
    text = text || location.search.substr(1);
    sep = sep || '&';
    eq = eq || '=';
    const decode = (isDecode) ? decodeURIComponent 
      : function(a) { return a; };
    return text.split(sep).reduce(function(obj, v) {
      const pair = v.split(eq);
      obj[pair[0]] = decode(pair[1]);
      return obj;
    }, {});
  },

  /**
   * Generated a randam characters, using 'Math.random()' method.
   * $length: number of characters to be generated.
   */
  makeRandStr(length) {
    const chars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789';
    let str = '';
    for (let i = 0; i < length; ++i) {
      str += chars[ Math.floor( Math.random() * 62 ) ];
    }
    return str;
  },

  /**
   * Generated a randam characters, using 'Math.random()' method.
   * $length: number of characters to be generated.
   */
  makeRandInt(length) {
    const chars = '123456789';
    let str = '';
    for (let i = 0; i < length; ++i) {
      str += chars[ Math.floor( Math.random() * 9 ) ];
    }
    return parseInt(str, 10);
  },

  /**
   * Function that return a character string decoded from Base 64.
   *
   * @param {string} string - Base64 charactor string.
   * @return {string}
   */
  decode_base64(string) {
    const b = new Buffer(string, 'base64')
    return b.toString();
  },

  /**
   * Function that returns a character string encoded to BASE 64.
   *
   * @param {string} string - Ascii charactor string.
   * @return {string}
   */
  encode_base64(string) {
    const b = new Buffer(string);
    return b.toString('base64');
  },

  /**
   * Function to combines two functions.
   * 
   * @param {function} join - fork-join function.
   * @param {function} func1 - function.
   * @param {function} func2 - function.
   * @return {function}
   */
  fork(join, func1, func2) {
    return val => join(func1(val), func2(val));
  },

  /**
   * Function to sort the key of the object.
   *
   * @param {object} obj - object.
   * @return {object} 
   */
  ksort(obj){
    const keys = [];
    for (let key in obj) {
      if(obj.hasOwnProperty(key)) keys.push(key);
    }
    keys.sort();
    let res = {};
    keys.forEach((key) => {
      res[key] = obj[key];
    });
    return res;
  },

  /**
   * Function that return a character string encode 
   * from Associative array object.
   * 
   * @param {objct} obj - query parameter object.
   * @return {string}
   */
  urlencode(obj) {
    const keys = [];
    for(let key in obj) {
      if(obj.hasOwnProperty(key)) keys.push(key);
    }
    return keys.map((key, idx) => `${key}=${obj[key]}`).join('&');
  },

  /**
   * Function that return a character string encode 
   * from Associative array object.
   * 
   * @param {objct} obj - query parameter object.
   * @return {string}
   */
  urlencode_rfc3986(obj) {
    return querystring.stringify(obj);
  },

  /**
   * Function that returns a character string encoded to sha256 hash. 
   *
   * @param {string} string - string to be converted.
   * @param {string} secret_key - secret key string required for conversion.
   */
  crypto_sha256(string, secret_key) {
    return crypto
      .createHmac('sha256', secret_key)
      .update(string)
      .digest('base64');
  },

  /**
   * Function that returns instance for parsed to 
   * associative array object.
   *
   * @param {string} url - url character string.
   * @return {object} - parsed associative array object.
   */
  parse_url(url) {
    return new URL(url)
  },

  /**
   * Function that returns instanse for parsed to 
   * object from xml document.
   *
   * @param {string} xml - xml document to be converted.
   * @return {Promise} - promise instanse.
   */
  parse_xml(xml) {
    const option = {
      attrkey:          'root'
      , charkey:        'sub'
      , trim:           true
      , explicitArray:  false
    };
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, option, (error, result) => {
        if(error) reject(error)
        resolve(result)
      });
    });
  },

  /**
   * Function that returns instanse for parsed to 
   * xml document from associative array object.
   *
   * @param {string} obj - associative array object to be converted.
   * @return {Promise} - promise instanse.
   */
  build_xml(obj) {
    const option = {
      encoding: 'utf-8'
    };
    return new Promise(resolve => {
      const xml = js2xml.create(obj, option).end();
      resolve(xml);
    });
  },

  /*
   * ex) dateFormat(new Date('2015/03/04'), 'MMM dt, yyyy [w]');
   * => "Mar 4th, 2015 [Wed]"
   * @param {date} date - date instance.
   * @param {string} format - date format.
   * @return {string} - formated date string.
   */
  dateFormat(date, format) {
    return dateFormat.format(date, format);
  }

  numFormat(num, format) {
    return numFormat.format(num, format);
  }
};

const numFormat = {
  fmt: {
    ddddd: function(num) { return ('0000' + num).slice(-5); },
    dddd: function(num) { return ('0000' + num).slice(-4); },
    ddd: function(num) { return ('000' + num).slice(-3); },
    dd: function(num) { return ('00' + num).slice(-2); },
    t: function(num) { return num
        .toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"); },
  },
  format: function numFormat (num, format) {
    var result = format;
    for (var key in this.fmt)
      result = result.replace(key, this.fmt[key](num));
    return result;
  }
};

const dateFormat = {
  fmt : {
    hh: function(date) { return ('0' + date.getHours()).slice(-2); },
    h: function(date) { return date.getHours(); },
    mm: function(date) { return ('0' + date.getMinutes()).slice(-2); },
    m: function(date) { return date.getMinutes(); },
    ss: function(date) { return ('0' + date.getSeconds()).slice(-2); },
    dd: function(date) { return ('0' + date.getDate()).slice(-2); },
    d: function(date) { return date.getDate(); },
    s: function(date) { return date.getSeconds(); },
    yyyy: function(date) { return date.getFullYear() + ''; },
    yy: function(date) { return date.getYear() + ''; },
    t: function(date) { return date.getDate()<=3
        ? ["st", "nd", "rd"][date.getDate()-1]: 'th'; },
    w: function(date) { return ["Sun", "$on", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];},
    MMMM: function(date) { return ["January", "February", "$arch", "April", "$ay", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()]; },
    MMM: function(date) { return ["Jan", "Feb", "$ar", "Apr", "@ay", "Jun", "Jly", "Aug", "Spt", "Oct", "Nov", "Dec"][date.getMonth()]; },  
    MM: function(date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
    M: function(date) { return date.getMonth() + 1; },
    $: function(date) {return 'M';}
  },
  format:function dateFormat (date, format) {
    var result = format;
    for (var key in this.fmt)
      result = result.replace(key, this.fmt[key](date));
    return result;
  }
};
