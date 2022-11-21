const express = require('express');
const shoppingListController = require('../controller/shoppingListController');
const authController = require('./../controller/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('user'), shoppingListController.getAllList)
  .post(authController.restrictTo('user') ,shoppingListController.createList);

router
  .route('/:id')
  .get(shoppingListController.getList)
  .patch(shoppingListController.updateList)
  .delete(shoppingListController.deleteList);

module.exports = router;  