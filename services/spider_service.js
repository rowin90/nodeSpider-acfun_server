const db = require("./mongoose_service");
const axios = require("axios");
const cheerio = require("cheerio");
const RedisService = require("./content_id_service");
// todo
// const jieba = require("nodejieba");

const Article = require("../models/article");

class Tag {
  constructor(name, value, score) {
    this.name = name;
    this.score = score;
    this.value = value;
  }
}

async function spideringArticles(count) {
  let ids = await RedisService.getRandomAcfunIds(count);
  // ids = ["11509174", "11508415", "11508739"];
  // console.log(ids);
  let succeedCount = 0;
  let errCount = 0;

  for (const id of ids) {
    await getSingleArticle(id)
      .then(r => {
        succeedCount++;
      })
      .catch(e => {
        errCount++;
        if (e.errorCode !== 404000) {
          throw e;
        }
      });
    await new Promise(rsv => {
      setTimeout(rsv, 1000);
    });
  }

  return {
    succeedCount,
    errCount
  };
}

async function getSingleArticle(id) {
  const url = `https://www.acfun.cn/a/ac${id}`;
  // console.log(url);

  const res = await axios.get(url).catch(e => {
    if (e.response && e.response.status && e.response.status == 404) {
      const err = new Error("Not Found");
      err.errorCode = 404000;
      throw err;
    } else {
      throw e;
    }
  });

  const html = res.data;

  const $ = cheerio.load(html);

  const articleContent = $("#main");

  if (!articleContent) {
    // return
    // if 404 . do nothing
    // if delete from acfun,do nothing
    // if is a video, put id back to pool

    return;
  } else {
    // 添加到数据库
    await RedisService.markArticleIdsSucceed(id);
  }

  const doms = articleContent.find("script")[0];
  const context = $(doms).html();
  const temp = context.split("window.articleInfo =")[1];
  const originHtml = JSON.parse(temp.slice(0, temp.length - 1));

  // 爬取正文
  const title = originHtml.title;
  const originCreatedAt = originHtml.createTime;
  const coverImage = originHtml.coverUrl;
  const description = originHtml.description;
  const commentCount = originHtml.formatCommentCount;

  // 分类
  const tags = [];

  /*  const titleTags = jieba.extract(title, 5);
  for (const t of titleTags) {
    tags.push(new Tag("ARTICLE_TAG_TITLE", t.word, t.weight));
  } */
  const articleTagCategory = originHtml.channel;
  tags.push(new Tag("ARTICLE_TAG_CATEGORY", articleTagCategory.name, 1));

  const articleTagName = originHtml.realm;
  tags.push(new Tag("ARTICLE_TAG_NAME", articleTagName.realmName, 1));

  const bdTag = originHtml.tagList;
  tags.push(...bdTag.map(tag => new Tag("ARTICLE_TAG_USER", tag.name, 1)));

  // 正文
  const originalContent = originHtml.parts[0].content;
  // console.log(originalContent);

  const dom = $(originalContent);

  const content = getTextOrImg(dom, []);

  function getTextOrImg(dom, arr) {
    const d = $(dom);
    const children = d.children();
    if (d.text()) {
      arr.push(d.text());
    }
    if (children.length === 0) {
      if (d.attr("src")) {
        arr.push(d.attr("src"));
      }
    } else {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        getTextOrImg(child, arr);
      }
    }
    return arr;
  }

  // console.log(content);

  const article = {
    acfunId: id,
    content: content,
    originalContent: originalContent,
    createdAt: Date.now().valueOf(),
    originCreatedAt: originCreatedAt,
    title: title,
    tags: tags,
    coverImage: coverImage,
    description: description,
    commentCount: commentCount
  };

  // console.log(article);

  const articles = await Article.model.findOneAndUpdate(
    {
      acfunId: id
    },
    {
      $setOnInsert: article
    },
    {
      upsert: true,
      new: true
    }
  );
}

module.exports = {
  spideringArticles,
  getSingleArticle
};
