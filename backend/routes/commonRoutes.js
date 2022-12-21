const express=require("express");
const router=express.Router();
const User=require("../Models/User")
const jwt=require("jsonwebtoken")
const dotenv=require("dotenv")
const nodemailer = require('nodemailer');
const Instructor=require("../Models/Instructor")
const Trainee=require("../Models/Trainee")
// @ts-ignore
const cookieParser = require("cookie-parser");
// @ts-ignore
const sessions = require('express-session');
dotenv.config()

router.post("/login",async function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    // console.log(username)
    var query=await User.find({Email:username,Password:password});
    if(query.length != 0){
        var user={username:username,password:password,id:query[0].id,job:query[0].Job,country:""}
    var token=jwt.sign(user,process.env.ACCESSTOKEN,{
        expiresIn: "2h",
      })
    // @ts-ignore
    res.json(token)
    }else{
        
        var query=await User.find({Email:username});
        if(query.length!=0)
        res.json({user:false,pass:true})
        else
        res.json({user:true,pass:false})
    }
    
})
router.post("/verifyToken",function(req,res){
    var token=req.body.token;
    if(token){
        try{
            const user=jwt.verify(token,process.env.ACCESSTOKEN);
            //throw new Error("abc")
            res.json(user)
    
        }
        catch(err){
                throw new Error("aaa")
            
        }
    
    }else{
        res.json("12")

    }

})
// @ts-ignore
router.post("/selectCountry/:x/:token",function(req,res){
        var country=req.params.x;
        if(token!="-1"){
            const user=jwt.verify(req.params.token,process.env.ACCESSTOKEN)
            user.country=country;
            const token=jwt.sign(user,process.env.ACCESSTOKEN);
            res.json(token)
        }else{
            const user={country:country};
            const token=jwt.sign(user,process.env.ACCESSTOKEN);
            res.json(token)
        }
})
router.get("/findEmail/:email",async function(req,res){
    var email=req.params.email;
    var query=await User.find({Email:email});
    if(query.length==0){
        res.json("no")
    }else{
        res.json(query[0].id);
    }
})
router.get("/sendEmail/:to/:link",function(req,res){
    console.log("11");
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "ziadayman9901@gmail.com",
            pass: "lwnociqszlkncnuu"
        }
      });
      transporter.verify().then(console.log).catch(console.error);
    // console.log(req.params.to+" "+req.params.link) 
    let mailDetails = {
        from: 'ziadayman9901@gmail.com',
        to: req.params.to,
        subject: 'Reset Password',
        text: "here is the link to reset your password \n " ,
        html:`<p>Click <a href=http://localhost:3000/resetPass?email=${req.params.to}> here </a> to reset password </p>`
    };
     
    transporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
    });
    res.json("ok");
})
router.get("/sendEmailAttach/:to/:courseName",function(req,res){
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "ziadayman9901@gmail.com",
            pass: "lwnociqszlkncnuu"
        }
      });
      transporter.verify().then(console.log).catch(console.error);
    // console.log(req.params.to+" "+req.params.link) 
    let mailDetails = {
        from: 'ziadayman9901@gmail.com',
        to: req.params.to,
        subject: 'Congratulations',
        text: "you have successfully completed the "+req.params.courseName+" course" ,
        attachments: [{
            filename: 'Certificate.pdf',
            path: 'C:/Users/Ziad/OneDrive/Desktop/react certificate.pdf', 
            contentType: 'application/pdf'
          }]
    };
     
    transporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            // console.log('Error Occurs');
        } else {
            // console.log('Email sent successfully');
        }
    });
    res.json("ok");
})
router.get("/resetPass/:email/:pass",async function(req,res){
   var result=await User.findOne({Email:req.params.email});
   await User.findOneAndUpdate({Email:req.params.email},{Password:req.params.pass});
   if(result.Job=="Instructor"){
    await Instructor.findOneAndUpdate({Email:req.params.email},{Password:req.params.pass})
   }else if(result.Job=="Trainee"){
    await Trainee.findOneAndUpdate({Email:req.params.email},{Password:req.params.pass})

   }
})
router.post('/CreateUser' ,(req,res)=>{
    var name = req.body.name
    var username = req.body.username
    var email = req.body.email
    var password = req.body.password;
    var gender = req.body.gender    
    User.find({}).exec(async function(err,result){
        var c=result.length;
        var query=await User.find({Email:email});
        var query2 = await User.find({Username:username})
        if(query2.length!==0){
            res.json("Username Taken")
        }else{

            if(query.length==0){  
                var object = new User({id:c+1,Name:name,Email:email,Password:password,Username:username,Job:"Trainee",Gender:gender})
                var object2=new Trainee({id:c+1,Name:name,type:"Individual"});
                object.save(function(err,result1){
                    object2.save(function(err,result){
                        
                    })
                    res.json("ok")
                })
            }else{
                res.json("email exist")
            } 
        }
            
    })


})
router.get("/downloadFile",function(req,res){
    
    res.download("./filesDownload/react certificate.pdf");
})



module.exports=router;