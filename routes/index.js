var express = require('express');
var speakeasy = require('speakeasy')
var qr = require('qr-image');
var validator = require('validator');

var router = express.Router();

var data = {};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { errors: [] });
});



router.get('/qr', function(req, res) {
  
  // Generate a secret
  data.secret = speakeasy.generateSecret( {name: 'M8T2:epsbgt@gmail.com'});
  data.secret_key = data.secret.base32;

   // Get QR code URL
  //data.qrPath = '/qrcode?qrurl=' + encodeURIComponent(data.secret.otpauth_url);
  data.qr = 'https://chart.googleapis.com/chart?cht=qr&chl=' + encodeURIComponent(data.secret.otpauth_url) + '&chs=166x166&chld=L|0';

  res.render('qr', { data: data, errors: [] });
});



router.get('/qrcode', function(req, res) {
  var code = qr.image(req.query.qrurl, { type: 'png' });
  res.type('png');
  code.pipe(res);
});



router.get('/validar', function(req, res) {
  if ( !data.secret )
   	data.secret = "";
  
  res.render('validar', { data: data, errors: [] } );
});


router.get('/result', function(req, res) {
  
  data.secret_key = "";
  data.totp_code = "";
  data.result = "";

  if ( !validateSecretKey(req.query.secret_key) ) {
    data.result = "El Secret Key introducido NO tiene un formato correcto";
    res.render('result', { data: data, errors: [] } );
    return;
  }

  if ( !validateTOTP(req.query.totp_code) ) {
    data.result = "El TOTP introducido NO tiene un formato correcto";
    res.render('result', { data: data, errors: [] } );
    return;
  }
    

  data.secret_key = req.query.secret_key;
  data.totp_code = req.query.totp_code;
  
  if ( verifyToken(data.secret_key, data.totp_code) )
      data.result = "Código TOTP CORRECTO!!!";
  else
      data.result = "Código TOTP INCORRECTO!!!";  

    res.render('result', { data: data, errors: [] } );
});




function verifyToken(secret, token) {
  // Returns true if the token matches
  return speakeasy.totp.verify({
  	secret: secret, 
  	encoding: 'base32', 
  	token: token,
  	window: 3
  });
}

function validateSecretKey(secret) {
  if ( !secret || !validator.isAlphanumeric(secret) )
    return false;

  return true;
}

function validateTOTP(totp) {
  if (!totp || !validator.isNumeric(totp) )
    return false;

  return true;
}

module.exports = router;

