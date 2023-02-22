const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    price: String,
    category: String,
    brand : String,
    userId:String

})

module.exports = mongoose.model('products', productSchema);