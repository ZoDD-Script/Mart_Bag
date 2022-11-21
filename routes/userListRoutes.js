const express = require('express');
const shoppingListController = require('../controller/shoppingListController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router
  .route('/')
  .get(shoppingListController.getUserLists);

router
  .route('/:id')
  .get(shoppingListController.getUserList)

module.exports = router