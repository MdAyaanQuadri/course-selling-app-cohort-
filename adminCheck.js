function admin(req,res,next){
    const response = req.response;
    if(response.user.role === "admin"){
        next();
    } else{
        return res.status(401).json({
            message:"unauthorized access"
        })
    }

}
module.exports = {
    admin
}