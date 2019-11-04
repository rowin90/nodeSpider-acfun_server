const redis = require("./redis_service");

const ACFUN_ID_SET_REDIS_KEY = "acfun_id_set";
const ACFUN_ARTICLE_GOT_ID_SET = "acfun_article_got_id_set";

//  1140 1155
//  11400000
async function generateAcfunIdsRedis(min, max) {
  const ITERATION = 10000;
  for (let i = min; i < max; i++) {
    const arr = new Array(ITERATION);
    for (let j = 0; j < ITERATION; j++) {
      const index = i * ITERATION + j;
      arr[j] = index;
    }
    await redis.sadd(ACFUN_ID_SET_REDIS_KEY, ...arr);
  }
}

async function getRandomAcfunIds(count) {
  const ids = await redis.spop(ACFUN_ID_SET_REDIS_KEY, count);
  return ids;
}

async function markArticleIdsSucceed(id) {
  redis.sadd(ACFUN_ARTICLE_GOT_ID_SET, id);
}
async function idBackPool(id) {
  redis.sadd(ACFUN_ID_SET_REDIS_KEY, id);
}

async function getRemainingIDCount() {
  return await redis.scard(ACFUN_ID_SET_REDIS_KEY).then(r => Number(r));
}

module.exports = {
  generateAcfunIdsRedis,
  getRandomAcfunIds,
  markArticleIdsSucceed,
  idBackPool,
  getRemainingIDCount
};
