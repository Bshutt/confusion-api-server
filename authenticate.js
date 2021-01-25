var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStategy = require('passport-jwt').Strategy
var ExractJwt = require('passport-jwt').ExtractJwt;;
var jwt = require('jsonwebtoken');
var config = require('./config')
 

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassort = passport.use(new JwtStategy(opts, 
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err){
                return done(err, false);
            }
            else if (user){
                return done(null, user)
            }
            else{
                return done(null, false);
            }
        });
    }));

    exports.verifyUser = passport.authenticate('jwt', {session: false});
    exports.verifyAdmin = (req,res,next) => {
        if(!req.user.admin){
            res.status = 403
            var err = new Error('You are not Authorized to perform this action!');
            return next(err)
        }
        else{
            next()
        }
    };
    