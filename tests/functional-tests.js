const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Create issue - All fields', function (done) {
    const issue = {
      issue_title: "Faux Issue Title",
      issue_text: "Functional Test - Every field filled in",
      created_by: "Ryan",
      assigned_to: "Chai",
      status_text: "",
      open: true
    };
    
    chai
      .request(server)
      .post('/api/issues/test-project')
      .send(issue)
      .end((err,res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isOk(res.body._id);
        assert.equal(res.body.issue_title, issue.issue_title);
        assert.equal(res.body.issue_text, issue.issue_text);
        assert.equal(res.body.created_by, issue.created_by);
        assert.equal(res.body.assigned_to, issue.assigned_to);
        assert.equal(res.body.status_text, issue.status_text);
        assert.equal(res.body.open, issue.open);
        assert.isOk(res.body.created_on);
        assert.isOk(res.body.updated_on);        
        done();
      });
  });

  test('Create issue - Required fields only', function (done) {
    const issue = {
      issue_title: "Faux Issue Title",
      issue_text: "Functional Test - Required fields filled in",
      created_by: "Ryan"
    };
    
    chai
      .request(server)
      .post('/api/issues/test-project')
      .send(issue)
      .end((err,res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isOk(res.body._id);
        assert.equal(res.body.issue_title, issue.issue_title);
        assert.equal(res.body.issue_text, issue.issue_text);
        assert.equal(res.body.created_by, issue.created_by);
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.equal(res.body.open, true);
        assert.isOk(res.body.created_on);
        assert.isOk(res.body.updated_on);
        done();
      });
  });

  test('Create issue - Missing required fields', function (done) {
    const issue = {
      created_by: "Ryan",
      assigned_to: "Chai",
      status_text: "",
      open: true
    };
    
    chai
      .request(server)
      .post('/api/issues/test-project')
      .send(issue)
      .end((err,res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("Get all issues", function (done) {
    chai
      .request(server)
      .get('/api/issues/test-project')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        done();
      });
  });
  
  test("Get issues w/ one filters", function (done) {
    chai
      .request(server)
      .get('/api/issues/test-project?open=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        done();
      });
  });
  
  test("Get issues w/ multiple filters", function (done) {
    chai
      .request(server)
      .get('/api/issues/test-project?open=true&assigned_to=Chai%20and%20Mocha')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        done();
      });
  });
  
  test("Update issue w/ single field", function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({ "_id": "62469a0644edc12419052bfd", "issue_title": "new title" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "62469a0644edc12419052bfd");
        done();
      });
  });

  test("Update issue w/ multiple fields", function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({ 
        "_id": "62469a0644edc12419052bfd", 
        "issue_title": "new title",
        "issue_text": "new text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "62469a0644edc12419052bfd");
        done();
      });
  });

  test("Update issue w/ missing _id", function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({
        "issue_title": "new title",
        "issue_text": "new text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update issue w/ no fields to update", function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({
        "_id": "624505d9ff864145788c0f69"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, "624505d9ff864145788c0f69");
        done();
      });
  });

  test("Update issue w/ invalid _id", function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({
        "_id": "624505d9ff864145788c0aaa",
        "issue_title": "new title",
        "issue_text": "new text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "624505d9ff864145788c0aaa");
        done();
      });
  });

  test("Delete issue", function (done) {
    chai
      .request(server)
      .delete('/api/issues/test-project')
      .send({
        "_id": "62450640d9ea27e3ba5ec477"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "62450640d9ea27e3ba5ec477");
        done();
      });
  });
  
  test("Delete issue w/ invalid _id", function (done) {
    chai
      .request(server)
      .delete('/api/issues/test-project')
      .send({
        "_id": "624505d9ff864145788c0aaa"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "624505d9ff864145788c0aaa");
        done();
      });
  });

  test("Delete issue w/ missing _id", function (done) {
    chai
      .request(server)
      .delete('/api/issues/test-project')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
