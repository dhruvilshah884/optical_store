function isUser(req,res,next){
    if(req.session && req.session.user){
        next();
    }else{
        res.redirect('/login');
    }
}

function isuser(req,res,next){
    if (req.session && req.session.user && req.session.user.role === "User") {
        next();
    } else {
        res.redirect('/login');
    }
}

function isSeller(req,res,next){
    if (req.session && req.session.user && req.session.user.role === "Seller") {
        next();
    } else {
        res.redirect('/404');
    }
}

function isPaidSeller(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === "Seller" && req.session.user.isPayment === true) {
        next();
    } else {
        res.redirect('/404');
    }
}

function isAdmin(req, res, next) {
    if (req.session && req.session.admin && req.session.admin.email === 'admin@gmail.com' && req.session.admin.password === '123') {
        next();
    } else {
        res.redirect('/404');
    }
}

function isSellerAndAdmin(req, res, next){
    if (req.session && req.session.admin && req.session.admin.email === 'admin@gmail.com' && req.session.admin.password === '123' || req.session.user && req.session.user.role === "Seller" ) {
        next();
    } else {
        res.redirect('/404');
    }
}



module.exports = {User: isUser , properUser: isuser , Seller: isSeller ,paidSeller: isPaidSeller, Admin: isAdmin, Both: isSellerAndAdmin};