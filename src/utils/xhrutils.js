/**
 * encodeFormData
 *
 * @param {object} data 
 * @returns {string}
 */
var encodeFormData = function(data) {
  if (!data) return ""
  var pairs = [];
  for(var name in data) {
    if (!data.hasOwnProperty(name)) continue;
    if (typeof data[name] === "function") continue;
    var value = data[name].toString();
    name = encodeURIComponent(name.replace(" ", "+"));
    value = encodeURIComponent(value.replace(" ", "+"));
    pairs.push(name + "=" + value);
  }
  return pairs.join('&');
};

/**
 * get
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
var get = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.send(null);
};
module.exports.get = get;

/**
 * getJSON
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
var getJSON = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(JSON.parse(request.statusText));
  };
  request.send(null);
};
module.exports.getJSON = getJSON;

/**
 * post
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
*/
var post = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type.indexOf("xml") !== -1 && request.responseXML) {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type"
    , "application/x-www-form-urlencoded");
  request.send(encodeFormData(data));
};
module.exports.post = post;

/**
 * getData
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
var getData = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("GET", url + "?" + encodeFormData(data));
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.send(null);
};
module.exports.getData = getData;

/**
 * postData
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
*/
var postData = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type"
    , "application/x-www-form-urlencoded");
  request.send(encodeFormData(data));
};
module.exports.postData = postData;

/**
 * postXML
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
var postXML = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
  for(var key in data.head) {
    request.setRequestHeader(key, data.head[key]);
  }
  request.send(data.body);
};
module.exports.postXML = postXML;

/**
 * postJSON
 *
 * @param {string} url 
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
var postJSON = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("POST", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var type = request.getResponseHeader("Content-Type");
        if (type === "text/xml; charset=utf-8") {
          success(request.responseXML);
        } else if (type === "application/json; charset=utf-8") {
          success(JSON.parse(request.responseText));
        } else {
          success(request.responseText);
        }
      } else {
        error(JSON.parse(request.responseText));
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};
module.exports.postJSON = postJSON;

/**
 * putJSON
 *
 * @param {string} url
 * @param {object} data 
 * @param {function} success 
 * @param {function} error 
 */
var putJSON = function(url, data, success, error) {
  var request = new XMLHttpRequest();
  request.open("PUT", url);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        success(request);
      } else {
        error(request.responseText);
      }
    }
  };
  request.onerror = function(e) {
    error(request.statusText);
  };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data));
};
module.exports.putJSON = putJSON;
