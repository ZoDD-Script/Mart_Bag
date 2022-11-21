const ShoppingList = require('../model/shoppingListModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel.js');

exports.createList = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  const email = user.email;
  // console.log(email, "gggggggg");
  
  if (!req.body.user) req.body.user = req.user.id;
  const list = await ShoppingList.create({
    title: req.body.title,
    reminder: req.body.reminder,
    items: req.body.items,
    userEmail: email,
    user
  });

  res.status(201).json({
    status: 'success',
    data: {
      list
    }
  })
});

exports.getUserLists = catchAsync(async (req, res, next) => {
  const lists = await ShoppingList.find({user: req.user._id});
  
  res.status(200).json({
    status: 'success',
    result: lists.length,
    data: {
      lists
    }
  })
});

exports.getUserList = catchAsync(async (req, res, next) => {
  const list = await ShoppingList.findById({user: req.user.id});

  if(!list) {
    return next(new AppError('A list with that id no longer exist! Please use a valid id'));
  };

  res.status(200).json({
    status: 'success',
    data: {
      list
    }
  })
})

exports.getAllList = catchAsync(async (req, res, next) => {
  const lists = await ShoppingList.find();

  res.status(200).json({
    status: 'success',
    results: lists.length,
    data: {
      lists
    }
  });
});

exports.getList = catchAsync(async (req, res, next) => {
  const list = await ShoppingList.findById(req.params.id);

  if (!list) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      list
    }
  });
});

exports.deleteList = catchAsync(async (req, res, next) => {
    // const list = await ShoppingList.findByIdAndUpdate(req.params.id, {active: false});
    const list = await ShoppingList.findByIdAndDelete(req.params.id);

    if (!list) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateList = catchAsync(async (req, res, next) => {
    const list = await ShoppingList.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!list) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: list
      }
    });
  });