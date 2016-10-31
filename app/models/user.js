var mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
    twitter:{
        id: String,
        email: String,
        username: String,
        displayName: String,
        token: String,
        tokenSecret: String
    },
    facebook:{
        id: String,
        token: String,
        email: String,
        name: String
    }
})

// let UserSchema = mongoose.Schema({
//     username: String,
//     network:{
//         twitter: {
//             id: String,
//             displayName: String,
//             token: String
//         },
//         facebook: {
//             email: String,
//             id: String,
//             token: String    
//         }
//     }
// })

module.exports = mongoose.model('User', UserSchema)