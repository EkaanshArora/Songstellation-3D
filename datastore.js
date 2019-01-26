"use strict";

var mongodb = require('mongodb');
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
var collection;

// ------------------------------
// ASYNCHRONOUS PROMISE-BASED API
//  SEE BELOW FOR SYNCHRONOUS API
// ------------------------------

// Serializes an object to JSON and stores it to the database
function set(key, value) {
  return new Promise(function (resolve, reject) {
    if (typeof(key) !== "string") {
      reject(new DatastoreKeyNeedToBeStringException(key));
    } else {
      try {
        var serializedValue = JSON.stringify(value);
        collection.updateOne({"key": key}, {$set: {"value": serializedValue}}, {upsert:true}, function (err, res) {
          if (err) {
            reject(new DatastoreUnderlyingException(value, err));
          } else {
            resolve(res);
          }
        });
      } catch (ex) {
        reject(new DatastoreValueSerializationException(value, ex));
      }
    }
  });
}

// Fetches an object from the DynamoDB instance, deserializing it from JSON
function get(key) {
  return new Promise(function (resolve, reject) {
    try {
      if (typeof(key) !== "string") {
        reject(new DatastoreKeyNeedToBeStringException(key));
      } else {
        collection.findOne({"key":key}, function (err, data) {
          if (err) {
            reject(new DatastoreUnderlyingException(key, err));
          } else {
            try {
              if(data===null){
                resolve(null);
              }
              else{
                resolve(JSON.parse(data.value));
              }
            } catch (ex) {
              reject(new DatastoreDataParsingException(data.value, ex));
            }
          }
        });
      }
    } catch (ex) {
      reject(new DatastoreUnknownException("get", {"key": key}, ex));
    }
  });
}

function remove(key) {
  return new Promise(function (resolve, reject) {
    try {
      if (typeof(key) !== "string") {
        reject(new DatastoreKeyNeedToBeStringException(key));
      } else {
        collection.deleteOne({"key": key}, function (err, res) {
          if (err) {
            reject(new DatastoreUnderlyingException(key, err));
          } else {
            resolve(res);
          }
        });
      }
    } catch (ex) {
      reject(new DatastoreUnknownException("remove", {"key": key}, ex));
    }
  });
}

function removeMany(keys) {
  return Promise.all(keys.map(function (key) {
    return remove(key);
  }));
}

function connect() {
  return new Promise(function (resolve, reject) {
    try {
      mongodb.MongoClient.connect(MONGODB_URI, function(err, db) {
        if(err) reject(err);
        collection = db.collection(process.env.COLLECTION);
        resolve(collection);
      });
    } catch(ex) {
      reject(new DatastoreUnknownException("connect", null, ex));
    }
  });
}

function DatastoreKeyNeedToBeStringException(keyObject) {
  this.type = this.constructor.name;
  this.description = "Datastore can only use strings as keys, got " + keyObject.constructor.name + " instead.";
  this.key = keyObject;
}

function DatastoreValueSerializationException(value, ex) {
  this.type = this.constructor.name;
  this.description = "Failed to serialize the value to JSON";
  this.value = value;
  this.error = ex;
}

function DatastoreDataParsingException(data, ex) {
  this.type = this.constructor.name;
  this.description = "Failed to deserialize object from JSON";
  this.data = data;
  this.error = ex;
}

function DatastoreUnderlyingException(params, ex) {
  this.type = this.constructor.name;
  this.description = "The underlying DynamoDB instance returned an error";
  this.params = params;
  this.error = ex;
}

function DatastoreUnknownException(method, args, ex) {
  this.type = this.constructor.name;
  this.description = "An unknown error happened during the operation " + method;
  this.method = method;
  this.args = args;
  this.error = ex;
}

// -------------------------------------------
// SYNCHRONOUS WRAPPERS AROUND THE PROMISE API
// -------------------------------------------

var sync = require("synchronize");

function setCallback(key, value, callback) {
  set(key, value)
    .then(function (value) {
      callback(null, value);
    })
    .catch(function (err) {
      callback(err, null);
    });
}

function getCallback(key, callback) {
  get(key)
    .then(function (value) {
      callback(null, value);
    })
    .catch(function (err) {
      callback(err, null);
    });
}

function removeCallback(key, callback) {
  remove(key)
    .then(function (value) {
      callback(null, value);
    })
    .catch(function (err) {
      callback(err, null);
    });
}

function removeManyCallback(keys, callback) {
  removeMany(keys)
    .then(function (value) {
      callback(null, value);
    })
    .catch(function (err) {
      callback(err, null);
    });
}

function connectCallback(callback) {
  connect()
    .then(function (value) {
      callback(null, value);
    })
    .catch(function (err) {
      callback(err, null);
    });
}

function setSync(key, value) {
  return sync.await(setCallback(key, value, sync.defer()));
}

function getSync(key) {
  return sync.await(getCallback(key, sync.defer()));
}

function removeSync(key) {
  return sync.await(removeCallback(key, sync.defer()));
}

function removeManySync(keys) {
  return sync.await(removeManyCallback(keys, sync.defer()));
}

function connectSync() {
  return sync.await(connectCallback(sync.defer()));
}

function initializeApp(app) {
  app.use(function (req, res, next) {
    sync.fiber(next);
  });
}

var asyncDatastore = {
  set: set,
  get: get,
  remove: remove,
  removeMany: removeMany,
  connect: connect
};

var syncDatastore = {
  set: setSync,
  get: getSync,
  remove: removeSync,
  removeMany: removeManySync,
  connect: connectSync,  
  initializeApp: initializeApp
};

module.exports = {
  async: asyncDatastore,
  sync: syncDatastore
};