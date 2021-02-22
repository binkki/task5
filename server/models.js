const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        data: {
            type: String,
            required: true
        }
    }
)

const collection = mongoose.model('collection', collectionSchema);

module.exports = {
    collection
};
