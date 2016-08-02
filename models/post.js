var mongodb  = require('./db');
var markdown = require('markdown').markdown;

function Post(username, title, post) {
  this.username        = username;
  this.title           = title;
  this.post            = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date:    date,
      year :   date.getFullYear(),
      month :  date.getFullYear() + "-" + (date.getMonth() + 1),
      day :    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  }
  //要存入数据库的文档
  var post = {
      username:       this.username,
      time:           time,
      title:          this.title,
      post:           this.post,
      comment:        []
  };

  //打开数据库
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    //读取posts集合
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //将文档插入posts集合
      collection.insert(post, {safe:true}, function(err){
        mongodb.close();
        if(err){
          return callback(err);    //失败！返回err
        }
        callback(null);           //返回err为null
      });
    });
  });
};

//读取全部文章及其相关信息
Post.getTen = function(username, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (username) {
        query.username = username;
      }
      //根据 query 对象查询文章
      collection.count(query, function(err, total){
          collection.find(query,{
            skip: ( page -1 ) * 3,
            limit: 3
          }).sort({
            time: -1
          }).toArray(function (err, docs) {
            mongodb.close();
            if (err) {
              return callback(err);                              //失败！返回 err
            }
            docs.forEach(function (doc) {
                if(doc.post){
                    doc.post = markdown.toHTML(doc.post);
                }
            });
            callback(null,docs,total);               //成功！以数组形式返回查询的结果
          });
      });

    });
  });
};

//获取一篇文章
Post.getOne = function(username, day, title, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "username": username,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //解析 markdown 为 html
        if(doc){
            doc.post = markdown.toHTML(doc.post);
            if(doc.comments){
                doc.comments.forEach(function(comment){
                    comment.content = markdown.toHTML(comment.content);
                });
            }
        }
        callback(null, doc);//返回查询的一篇文章
      });
    });
  });
};

//编辑
Post.edit = function(username, day, title, callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('posts',function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        "username": username,
        "time.day": day,
        "title": title
      },function(err, doc){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null, doc);
      });
    });
  });
}

//更新一篇文章
Post.update = function(username, day, title, post, callback){
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.update({
        "username": username,
        "time.day": day,
        "title":    title
      },{
        $set: {post: post}
      }, function(err){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null);
      });
    });
  });
}

//删除一篇文章
Post.remove = function(username, day, title, callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.remove({
        "username": username,
        "time.day": day,
        "title":    title
      },{
        w: 1
      },function(err){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null);
      });
    });
  });
}
