const mongoose = require('mongoose');

const shoppingListSchema = mongoose.Schema({
  title: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: [true, 'Please provide a title for your shopping list']
  },
  reminder: {
    type: String,
    // required: [true, 'Please enter a date to be reminded about this shopping list']
  },
  items: [{
    name: String,
    quantity: String
  }],
  userEmail: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
},
{
  timestamp: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
}
);

shoppingListSchema.pre('save', function(next) {
  this.populate({
    path: 'user',
    select: '-_id'
  });
  // this.populate({
  //   path: 'userEmail',
  //   select: 'email'
  // })

  next();
});

// shoppingListSchema.pre('save', function(next) {
//   this.populate({
//     path: 'userEmail',
//     select: 'email'
//   })

//   next();
// });

shoppingListSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);
module.exports = ShoppingList;