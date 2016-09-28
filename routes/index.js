var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/some', function(req, res, next) {
  
  console.log('-------------------------------> some', process.env.GCM_KEY);
  res.send('some');
});

module.exports = router;
