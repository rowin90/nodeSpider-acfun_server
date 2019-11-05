const RedisService = require("../services/content_id_service");
const Spider = require("../services/spider_service");

switch (process.argv[2]) {
  case "generate_ids":
    RedisService.generateAcfunIdsRedis(process.argv[3], process.argv[4])
      .then(r => console.log("done"))
      .catch(e => {
        console.log(e);
        process.exit(1);
      });
    break;
  case "start_getting_articles":
    getArticleBG()
      .then(r => console.log("done"))
      .catch(e => {
        console.log(e);
        process.exit(1);
      });
    break;
  case "start_single_articles":
    Spider.getSingleArticle(process.argv[3])
      .then(r => console.log("done"))
      .catch(e => {
        console.log(e);
        process.exit(1);
      });
    break;
}

async function getArticleBG() {
  const numberPerTime = 5;

  while (true) {
    const remainingCount = await RedisService.getRemainingIDCount();

    if (remainingCount < numberPerTime) {
      break;
    }

    await Spider.spideringArticles(numberPerTime)
      .then(r => {
        console.log(r);
      })
      .catch(e => {
        console.log(e);
        process.exit(1);
      });
  }
}
