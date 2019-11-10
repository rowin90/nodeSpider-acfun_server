var express = require("express");
var router = express.Router();
const Article = require("../models/article");
const apiRes = require("../utils/api_response");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/spiderProtocol", (req, res) => {
  res.json({
    code: 0,
    protocol: {
      name: "FULL_NET_SPIDER_PROTOCOL",
      version: "0.1"
    },
    config: {
      contentList: {
        url: "https://106.12.12.89:3000/content",
        pageSizeLimit: 20,
        frequencyLimit: 5
      }
    }
  });
});

router.get("/content", (req, res) => {
  (async () => {
    const { pageSize, latestId } = req.query;
    const match = {};
    if (latestId)
      match._id = {
        $gt: latestId
      };
    const articles = await Article.model
      .find(match)
      .sort({ _id: 1 })
      .limit(Number(pageSize) || 10);

    const contentList = [];

    for (const a of articles) {
      contentList.push({
        title: a.title,
        contentType: "dom",
        content: {
          html: a.originalContent,
          text: a.content
        },
        tags: a.tags,
        contentId: a._id
      });
    }

    return {
      contentList
    };
  })()
    .then(r => {
      res.data = r;
      apiRes(req, res);
    })
    .catch(e => {
      res.json(e);
    });
});

module.exports = router;
