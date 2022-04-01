'use strict';
const { body, validationResult } = require('express-validator');
const ObjectID = require('mongodb').ObjectID;

const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.send({ error: errors.array()[0].msg });
    };
};

module.exports = function (app, myDatabase) {

  app.route('/api/issues/:project')
    .get(function (req, res){
      let query = { project: req.params.project };

      if (req.query._id)
        query["_id"] = new ObjectID(req.query._id);
      
      if (req.query.issue_title)
        query["issue_title"] = req.query.issue_title;

      if (req.query.issue_text)
        query["issue_text"] = req.query.issue_text;

      if (req.query.created_by)
        query["created_by"] = req.query.created_by;

      if (req.query.assigned_to)
        query["assigned_to"] = req.query.assigned_to;
      
      if ('open' in req.query)
        query["open"] = (req.query.open.toString().toLowerCase() === 'true');

      let options = { 
        sort: { created_on: 1 },
        projection: { project: 0 }
      };
      
      myDatabase.find(query, options).toArray((err, docs) => {
        if (err) {
          console.log(err);
          res.send(err);
        }
        
        res.json(docs);
      });
    })
    
    .post(
      validate([
        body('issue_title', "required field(s) missing").exists(),
        body('issue_text', "required field(s) missing").exists(),
        body('created_by', "required field(s) missing").exists()
      ]),
      function (req, res){
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
        
        const issue = {
          project: req.params.project,
          issue_title: issue_title ? issue_title : "",
          issue_text: issue_text ? issue_text : "",
          created_by: created_by ? created_by : "",
          assigned_to: assigned_to ? assigned_to : "",
          status_text: status_text ? status_text : "",
          open: true,
          created_on: new Date(),
          updated_on: new Date()
        }
        
        myDatabase.insertOne(issue, (err, doc) => {
          if (err) {
            console.log(err);
            res.send(err);
          }
          delete issue.project;
          
          res.send({"_id":doc.insertedId, ...issue});
        });
    })
    
    .put(
      validate([
        body('_id', "missing _id").exists()
      ]),
      function (req, res){
        let { issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
        const params = { issue_title, issue_text, created_by, assigned_to, status_text };

        for (let prop in params) 
          if (!params[prop]) delete params[prop];

        if ("open" in req.body)
          open = (req.body.open.toString().toLowerCase() === 'true');

        if (Object.keys(params).length == 0 && !("open" in req.body)) {
          return res.send({ "error": "no update field(s) sent", "_id": req.body._id });
        }
        
        myDatabase.findOneAndUpdate(
          {"_id": new ObjectID(req.body._id) },
          { 
            $set: {
              ...params,
              open,
              updated_on: new Date()
            }
          },
          { ignoreUndefined: true },
          (err, result) => {
          if (err) 
            res.send(err);

          if (result.value)
            res.send({ "result": "successfully updated", "_id": req.body._id });
          else 
            res.send({ "error": "could not update", "_id": req.body._id });
        });
    })
    
    .delete(
      validate([
        body('_id', "missing _id").exists()
      ]),
      function (req, res){
        myDatabase.deleteOne(
          {"_id": new ObjectID(req.body._id) },
          (err, result) => {
            if (err)
              res.send(err);

            console.log(result.value);
            if (result.deletedCount > 0)
              res.send({ "result": "successfully deleted", "_id": req.body._id });
            else 
              res.send({ "error": "could not delete", "_id": req.body._id });
          }
        );
    });
    
};
