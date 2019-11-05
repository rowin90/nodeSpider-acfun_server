const mongoose = require("mongoose");
const logger = require("../utils/loggers/logger");
const mongoSetting = require("../setting").mongo;

mongoose.Promise = Promise;

const uri = mongoSetting.uri;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const db = mongoose.connection;

db.on("open", () => {
  logger.info("db connected : " + uri);
});

db.on("error", e => {
  logger.error(`db error : ${uri}`, { err: e });
});

module.exports = db;
