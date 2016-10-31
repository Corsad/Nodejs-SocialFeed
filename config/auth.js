// config/auth.js
module.exports = {
  'development': {
    'facebook': {
      'clientID': '1820775691527600',
      'clientSecret': '5096c2bc9c4284e2c7903ee324f0408c',
      'callbackUrl': 'http://social-authenticator.com:8000/auth/facebook/callback'
    },
    'twitter': {
      'consumerKey': 'oIcCEwKgtVWRjFAp7DW2YLzJa',
      'consumerSecret': 't0vIFv7xBwlyIjzPBjFbU1eGrVaqJjkExjKA2mT5ESot861DNq',
      'callbackUrl': 'http://social-authenticator.com:8080/auth/twitter/callback'
    }
  }
}
