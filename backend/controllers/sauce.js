const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    
    delete sauceObject._id;
    delete sauceObject._userId;

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });

    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;

    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if(sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            }else {
                Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(401).json({ error }));

    
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            }else{
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' })})
                        .catch(error => res.status(401).json({ error }));
                })
            }
        })
};

exports.checkLikeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            const listUsersLiked = sauce.usersLiked;
            const listUsersDisliked = sauce.usersDisliked;

           switch(req.body.like){
                case 1:
                    if(listUsersLiked.length != 0){
                        for(let i=0; i < listUsersLiked.length; i++){
                            if(listUsersLiked[i] == req.auth.userId){
                                res.status(401).json({ message: 'Vous avez déjà liké cette sauce ! '});
                            }
                        };
                        
                        listUsersLiked.push(req.auth.userId);

                    }else {
                        listUsersLiked.push(req.auth.userId);
                    }; 
                    
                    Sauce.updateOne({ _id: req.params.id}, {
                        likes: listUsersLiked.length,
                        usersLiked: listUsersLiked,
                    })
                    .then(() => res.status(200).json({ message: 'Votre avis est enregistré !'}))
                    .catch(error => res.status(401).json({ error }));

                    break;
                case 0:
                    for(let i=0; i < listUsersLiked.length; i++){
                        if(listUsersLiked[i]  == req.auth.userId){
                            listUsersLiked.splice(i,1);
                        }
                    };

                    for(let i=0; i < listUsersDisliked.length; i++){
                        if(listUsersDisliked[i] == req.auth.userId){
                            listUsersDisliked.splice(i,1);
                        }
                    };

                    Sauce.updateOne({ _id: req.params.id}, {
                        likes: listUsersLiked.length,
                        dislikes: listUsersDisliked.length,
                        usersLiked: listUsersLiked,
                        usersDisliked: listUsersDisliked,
                    })
                    .then(() => res.status(200).json({ message: 'Votre avis est réinitialisé !'}))
                    .catch(error => res.status(401).json({ error }));

                    break;
                case -1:                    
                    if(listUsersDisliked.length != 0){
                        for(let i=0; i < listUsersDisliked.length; i++){
                            if(listUsersDisliked[i] == req.auth.userId){
                                res.status(401).json({ message: 'Vous avez déjà disliké cette sauce ! '});
                            }
                        };
                        
                        listUsersDisliked.push(req.auth.userId);

                    }else {
                        listUsersDisliked.push(req.auth.userId);
                    }; 
                    
                    Sauce.updateOne({ _id: req.params.id}, {
                        dislikes: listUsersDisliked.length,
                        usersDisliked: listUsersDisliked,
                    })
                    .then(() => res.status(200).json({ message: 'Votre avis est enregistré !'}))
                    .catch(error => res.status(401).json({ error }));
                    break;

           } 
        })
        .catch(error => res.status(401).json({ error }));
};