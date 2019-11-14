# nodeSpider-acfun_server
acfun 爬虫微服务，为 node 提供爬虫数据

# 启动脚本
```
$ script/spider.js
```
1. generate_ids           生成待爬取 ids
- 执行 node script/spider.js generate_ids 1140 1155    //  1140 1155  是范围，根据自己爬取的网站填写

2. start_getting_articles 开始爬取所有内容
- 执行  node script/spider.js start_getting_articles

3.start_single_articles  开始单个爬取内容
- 执行  node script/spider.js start_single_articles 1140000

> 如果是 pm2 管理进程，pm2 加参数需要 --
> 如 pm2 start script/spider.js -- generate_ids 1140 1155

# redis 
1. 生成待爬取的 ids，随机取出来爬取redis.spop，防止封号

# 技术栈
- express
- redis
- mongod + mongoose
- nodejieba 分词
