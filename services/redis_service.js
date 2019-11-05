const RedisSetting = require("../setting").redis;

var Redis = require("ioredis");
var client = new Redis({
  host: RedisSetting.host,
  port: RedisSetting.port
});

module.exports = client;
