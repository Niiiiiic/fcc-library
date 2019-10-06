/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.MONGO_URI;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.db('library').collection('shelf')
          .find({},{comments:0})
          .toArray((err, doc) => {
            // console.log(doc);
            if (err) {
            console.log(err);
            } else {
            res.send(doc);
            }
        })
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
     if ((req.body.title) && req.body.title !== ''){
      //response will contain new book object including atleast _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.db('library').collection('shelf')
          .findOne({title: title}, (err, data) => {
          if (err) {
            console.log(title + ' already in library');
          } else if (data) {
            console.log(title + ' already in library');  
            res.send(data);
          } else {
            db.db('library').collection('shelf')
              .insertOne({ title: title,
                           commentcount: 0,
                           comments: []}, (err, doc) => {
              if (err) {
                res.send('could not add book');
              } else {
                console.log('post',doc.ops[0]);
                res.json({_id: doc.ops[0]._id, title: doc.ops[0].title, commentcount: doc.ops[0].commentcount});
              }
            })
          }
        })
      }) //database connection
     } else {
       res.send('No title given');
     }   
  })
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.db('library').collection('shelf')
          .remove((err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log('complete delete successful');
            res.send('complete delete successful');
          }
        })
      }) //database connection
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.db('library').collection('shelf')
          .findOne({_id: ObjectId(bookid)},{commentcount: 0}, (err, data) => {
          if (err) {
            console.log(err);
          } else if (data) {
            //console.log(data);  
            res.send(data);
          } else {
            res.send('no book exists');
          }
        })
      }) //database connection
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.db('library').collection('shelf')
          .findOne({_id: ObjectId(bookid)}, (err, data) => {
          if (err) {
            console.log(err);
          } else if (data) {
            console.log(data);
            data.commentcount = data.commentcount+1;
            data.comments.push(comment);
              db.db('library').collection('shelf').save(data).then(update => {
                // console.log('update', data)
                res.send({_id: data._id, title: data.title, comments: data.comments})
              }).catch(error => {
                res.send('could not update ' + req.body._id)
              })
          } else {
            res.send('no book exists');
          }
        })
      }) //database connection
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
     MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.db('library').collection('shelf')
          .findOneAndDelete({_id: ObjectId(bookid)},{commentcount: 0}, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            res.send('delete successful')
          }
        })
      }) //database connection
    });
  
};
