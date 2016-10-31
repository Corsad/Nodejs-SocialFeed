var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var User = require('../models/user')
var configAuth = require('../../config/auth')

function configure(config){

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    if(config.twitter){
        passport.use(new TwitterStrategy(config.twitter, (token, tokenSecret, profile, done) =>{
            process.nextTick(function() {
            User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                if(err) return done(err)

                if(user){
                    console.log(user)
                    user.twitter.token = token
                    user.twitter.tokenSecret = tokenSecret
                    user.save(function(err){
                        if(err) throw err

                        return done(null,user)
                    })
                } else {
                    console.log(profile)
                    var newUser = new User()
                    newUser.twitter.id = profile.id
                    newUser.twitter.username = profile.username
                    newUser.twitter.displayName = profile.displayName;
                    newUser.twitter.token = token

                    newUser.save(function(err){
                        if(err) throw err

                        return done(null,newUser)
                    })
                }
            })
            })
        }))
    }

    if(config.facebook){
        passport.use(new FacebookStrategy(config.facebook, (token, tokenSecret, profile, done) =>{

        }))
    }
}

module.exports = {
    passport, configure
}

// module.exports = function(passport){
//     passport.serializeUser( function(user, done){
//         done(null, user.id)
//     })

//     passport.deserializeUser( function(id, done){
//         User.findById(id, function(err, user){
//             done(err, user)        
//         })
//     })

//     passport.use(new FacebookStrategy({
//         clientID: configAuth[NODE_ENV].facebook.clientID,
//         clientSecret: configAuth[NODE_ENV].facebook.clientSecret,
//         callbackURL: configAuth[NODE_ENV].facebook.callbackURL
//     }, function(token, refreshToken, profile, done){
               
//     }
//     ))
// }