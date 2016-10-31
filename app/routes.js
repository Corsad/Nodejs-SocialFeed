#!/usr/bin/env babel-node

let isLoggedIn = require('./middlewares/isLoggedIn')
let twitter = require('twitter')
let config = require('../config/auth')
var User = require('./models/user')
let Promise = require('songbird')

const NODE_ENV = process.env.NODE_ENV
let scope = 'email'
var posts = {}
var showTweet = {}

function getTwitter(req){
    const user = req.user
    return new twitter({
            consumer_key: config.development.twitter.consumerKey,
            consumer_secret: config.development.twitter.consumerSecret,
            access_token_key: user.twitter.token,
            access_token_secret: user.twitter.tokenSecret
        });
}

function sharePost(req, res){
    return new Promise((resolve, reject)=>{
        var client = getTwitter(req)

        var params = {id: req.params.id};
        client.post('statuses/retweet/' , params)
        resolve()
    })
}

function replyPost(req, res){
    return new Promise((resolve, reject)=>{
        var client = getTwitter(req)

        if(req.params.id){
            var params = {status: "@" + req.body.username + " - " + req.body.reply,
                      in_reply_to_status_id: req.params.id};
        } else {
            var params = {status: req.body.reply}
        }
        
        client.post('statuses/update/' , params, (err, response, body) =>{
            if(err){
                console.log(err)
            } else {
                resolve()
                console.log("shared")
            }
        })
    })
}

function getTweet(req, res){
    return new Promise((resolve, reject)=>{
        var client = getTwitter(req)
        var params = {id: req.params.id};
        client.get('statuses/show/' , params, function(error, tweet, response) {
            if (!error) {
                showTweet = {   created_at: tweet.created_at,  
                                id: tweet.id_str,
                                image: tweet.user.profile_image_url,
                                text: tweet.text,
                                name: tweet.user.name,
                                username: tweet.user.screen_name,
                                liked: tweet.favorited,
                                network: {
                                    icon: 'twitter',
                                    name: 'Twitter',
                                    class: 'btn-info'
                                }
                            }  
                resolve(tweet)
            } else {
                console.log(error)
            }
        })
    })
}

function postTimeline(req, res){
    return new Promise((resolve, reject)=>{
            var client = getTwitter(req)
            // console.log(config.development.twitter.consumerKey)
            // console.log(config.development.twitter.consumerSecret)
            // console.log(user.twitter.token)
            // console.log(user.twitter.tokenSecret)

            var params = {count: 20};
            client.get('statuses/home_timeline', params, function(error, tweets, response) {
                if (!error) {
                    posts = tweets.map(tweet => {
                        return {   created_at: tweet.created_at,  
                                    id: tweet.id_str,
                                    image: tweet.user.profile_image_url,
                                    text: tweet.text,
                                    name: tweet.user.name,
                                    username: tweet.user.screen_name,
                                    liked: tweet.favorited,
                                    network: {
                                        icon: 'twitter',
                                        name: 'Twitter',
                                        class: 'btn-info'
                                    }
                                }  
                    })

                    resolve(tweets)
                } else {
                    console.log(error)
                }
            });
    })        
}

module.exports = (app) => {
    let passport = app.passport

    app.get('/', (req, res) => res.render('index.ejs'))

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    })

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.get('/login', (req, res) => {
        res.render('login.ejs', {message: req.flash('error')})
    })

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error') })
    })

    app.get('/timeline', isLoggedIn, (req, res) => {
        Promise.all([postTimeline(req,res)]).then((data) =>{
            res.render('timeline.ejs', {
                posts: posts
                // posts: null
            })        
        })
    })

    // app.get('/auth/facebook', passport.authorize('facebook', {scope}))
    // app.get('/auth/facebook/callback', )

    app.get('/auth/twitter', passport.authenticate('twitter', {scope}))
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        })
    )

    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });


    app.get('/connect/twitter', passport.authorize('twitter', {scope}));
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        })
    )

    app.get('/share/:id', isLoggedIn, (req, res)=>{
        Promise.all([getTweet(req,res)]).then((data) =>{
            res.render('share.ejs', {
                post: showTweet
                // posts: null
            })
        })        
    })

    app.get('/reply/:id', isLoggedIn, (req, res)=>{
        Promise.all([getTweet(req,res)]).then((data) =>{
            res.render('reply.ejs', {
                post: showTweet
                // posts: null
            })
        })        
    })

    app.get('/compose', isLoggedIn, (req, res)=>{
        res.render('compose.ejs')
    })

    app.post('/share/:id', isLoggedIn, (req, res)=>{
        Promise.all([sharePost(req, res)]).then(() =>{
            Promise.all([postTimeline(req,res)]).then((data) =>{
                res.render('timeline.ejs', {
                    posts: posts
                    // posts: null
                })        
            })                    
        })
    })

    app.post('/compose', isLoggedIn, (req, res)=>{
        replyPost(req, res).then(() =>{
          postTimeline(req,res).then((data) =>{
            res.render('timeline.ejs', {
                posts: posts
                // posts: null
            })        
          })  
        })        
    })
    
    app.post('/reply/:id', isLoggedIn, (req, res)=>{
        Promise.all([replyPost(req, res)]).then(() =>{
            Promise.all([postTimeline(req,res)]).then((data) =>{
            res.render('timeline.ejs', {
                posts: posts
                // posts: null
            })        
            })    
        })    
    })
}
