const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  // Make changes here
});

// Make changes here for middleware if needed

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;