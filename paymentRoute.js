const express = require('express');
const payment_route = express();
const paymentController = require('./paymentController');
const path = require('path');
const bodyParser = require('body-parser');

payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended:false }));


payment_route.set('view engine','ejs');
payment_route.set('views',path.join(__dirname, '../views'));


payment_route.get('/', paymentController.renderProductPage);
payment_route.post('/createOrder', paymentController.createOrder);

module.exports = payment_route;
