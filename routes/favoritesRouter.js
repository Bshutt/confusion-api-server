// Imports
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteDish = require('../models/favorites');

// Global Variables
const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());


////////////////
/// Routes  ///
//////////////

// Root
favoritesRouter.route('/')
.options(cors.corsWithOptions, (req,res) => {
    res.sendStatus(200)})
.get(cors.cors,(req,res,next) => {
    favoriteDish.find({})
        .populate('user')
        .populate('dishes')
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})


.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /favorites');
})

.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})


.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    favoriteDish.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});



/////////////////////////////////////// Favorites by ID /////////////////////////////////////////////////

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => {
    res.sendStatus(200)})
.get(cors.cors,(req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.id);
})

.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
     favoriteDish.findOneAndUpdate({user: req.user._id})
     .populate('User')
     .populate('Dish')
     .then((favorites) => { 
         console.log(favorites)
         if (favorites === null){
             favoriteDish.create({user: req.user._id,dishes: req.params.dishId})
             
            .then((favorite) => {
            console.log('Favorite Created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err))
        .catch((err) => next(err));  
     }
        else if(favorites.dishes.indexOf(req.params.dishId) >= 0) {
            res.statusCode = 304;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
    }
         else { favorites.dishes.push(req.params.dishId)
         favorites.save()
         favoriteDish.findById(req.user._id)
         .populate('user')
         .populate('dishes')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
     }, (err) => next(err))
     .catch((err) => next(err));  
    }
      
},(err) => next(err))
.catch((err)=>next(err));
})

.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/');
})

.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => { 
        favoriteDish.findByIdAndUpdate(req.user._id,{$pull: req.params.dishId})
        .populate('user')
        .populate('dishes')
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
})

    


// Exports
module.exports = favoritesRouter;

