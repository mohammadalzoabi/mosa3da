const User = require('../models/User');

const ITEMS_PER_PAGE = 9;


exports.getApplications = (req, res, next) => {

    const page = +req.query.page || 1
    let totalApplications
    
    User.find().countDocuments()
        .then(numApplications => {
            totalApplications = numApplications
            return User.find({role: 'therapist', acceptedTherapist: 'No'})
                .skip((page-1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(users => {
            res.render('applications', {
                user: req.user,
                pageName:'applications',
                usersAll: users,
                pageTitle: 'Applications',
                path:'/applications',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalApplications,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalApplications / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postAcceptApplication = (req, res, next) => {
    const therapistEmail = req.body.userEmail;

    User.findOne({email: therapistEmail})
        .then(therapist => { 
            therapist.acceptedTherapist = 'Yes'
            return therapist.save()
                .then(results => {
                    console.log('Accepted Therapist');
                    res.redirect('/applications');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postDeclineApplication = (req, res, next) => {
    const therapistEmail = req.body.userEmail;

    User.findOne({email: therapistEmail})
        .then(therapist => { 
            therapist.acceptedTherapist = 'Yes'
            return User.deleteOne({email: therapistEmail})
                .then(results => {
                    console.log('Declined Therapist');
                    res.redirect('/applications');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}