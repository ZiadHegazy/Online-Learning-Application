const Course=require("../Models/Course");
const User=require("../Models/User");
const Instructor = require("../Models/Instructor");
const Trainee = require("../Models/Trainee");
const jwt=require("jsonwebtoken")
const dotenv=require("dotenv")
dotenv.config();
const express=require("express");
const Excercise = require("../Models/Excercise");
const router=express.Router();
// @ts-ignore
router.get("/allTitles",function(req,res){
    var query=Course.find({published:true,closed:false});
    // @ts-ignore
    query.exec(function(err,result){
        res.json(result.map((course)=>course.title))
    })
})
router.get("/getMaxPrice", async function(req,res)
{
    var query= await Course.find({})
    var max = 0;
    for (var i = 0 ; i<query.length; i++){
        if(query[i].price>max){
            max = query[i].price;
       }
    } 
        res.json(max)
})
// @ts-ignore
router.get("/",function(req,res){
    
    var query=Course.find({published:true,closed:false});
    // @ts-ignore
    query.exec(function(err,result){
        
        res.json(result)
    })
})
router.get("/filter-sub/:ratings/:subject",async function(req,res){
    var rating=req.params.ratings;
    var subject=req.params.subject;
    var query= await Course.find({published:true,closed:false});
    var array=[];
    for(var i=0;i<query.length;i++){

        if(rating==10){
            // console.log("AnaZero");
            if(subject != "-1" && query[i].subject.includes(subject)){
                array=array.concat([query[i]])
            }
        }else{
            for(var z=0;z<5;z++){
                if(subject != "-1" && query[i].subject.includes(subject) && query[i].rating.value==rating[z]){
                    array=array.concat([query[i]])
                }else if(query[i].rating.value==rating[z] && subject=="-1"){
                    array=array.concat([query[i]])
                }
            }
        }
    }
    // console.log(array)
    res.json(array);
})
router.get("/filter-price/:minprice/:maxprice",async function(req,res){
    var minprice=req.params.minprice;
    var maxprice=req.params.maxprice;
    var query=await Course.find({published:true,closed:false})
    
    // @ts-ignore
    var array=[];
    for(var i=0;i<query.length;i++){
        // console.log(query[i].price)
        var d1 = new Date();
        if(query[i].discount.amount>0&&query[i].discount.EndDate){
                var d2 = new Date(query[i].discount.EndDate)
                if(d2.getTime()>d1.getTime()){
                    if(query[i].price-(query[i].price*(query[i].discount.amount/100))>=minprice && query[i].price-(query[i].price*(query[i].discount.amount/100))<=maxprice){
                        array=array.concat([query[i]])
                    }
                }
            
        }
        else{

            if(query[i].price>=minprice && query[i].price<=maxprice){
                array=array.concat([query[i]])
            }
        }
    }
    res.json(array)
})
router.post("/create/:token",function(req,res){
    var token=req.params.token;
    try{
        var user=jwt.verify(token,process.env.ACCESSTOKEN)
    var query=Course.find({});
    // @ts-ignore
    var arr=req.body.subtitles;
    var hourArr=req.body.hours;
    // console.log(req.body.subject)
    var final=[];
    var totalhours=0;
    for(var i=0;i<arr.length;i++){
        final=final.concat([{title:arr[i],hours:hourArr[i],video:[""]}])
        totalhours+=hourArr[i];
    }
    query.exec(function(err,result){
        var object=new Course({id:result.length+1,title:req.body.title,subtitles:final,price:req.body.price,
        summary:req.body.summary,instructors:[user.id],subject:req.body.subject,hours:totalhours})
        // @ts-ignore
        // console.log("add course")
        object.save(function(req,res){
            
        })
        res.json(object)
    })
    }catch(err){
        res.json(err.message)
    }
    
})
router.post("/addCourseSub/:subtitle/:hours/:id",async function(req,res){
    var subtitle=req.params.subtitle
    var hours=Number(req.params.hours)
    var id=req.params.id;
    var course=await Course.findOne({id:id});
    
    var subtitles=course.subtitles.concat([{video:[""],lesson:"",description:"",title:subtitle,hours:hours,excerciseId:""}])
    
    await Course.findOneAndUpdate({id:id},{subtitles:subtitles,hours:Number(course.hours)+hours})
    res.json("ok")
}
)
router.get("/courseDetails/:id",function(req,res){
    var id1=req.params.id
    var query=Course.find({id:id1});
    // @ts-ignore
    query.exec(function(err,result){
        res.json(result)
    })
})
router.get("/search/:search",async function(req,res){
    var search=req.params.search;
    var query=await Course.find({});
    var array=[];

    var query2=await Instructor.find({})
    var id=-1;
    for(var i=0;i<query2.length;i++){
        if((query2[i].Name).toLowerCase().includes(search.toLowerCase())){
            id = query2[i].id;
        }
    }
    for(var i=0;i<query.length;i++){
        // console.log(query[i].title)
        if(query[i].title.toLowerCase().includes(search.toLowerCase()) || query[i].subject.includes(search.toLowerCase()) ||
        query[i].instructors.includes(id)){
            array=array.concat([query[i]])
        }
    }
    res.json(array)
})
router.get("/CourseItems/:id",async function(req,res)
{
    var id2 = req.params.id;
    var query = Course.find({id:id2});
    query.exec(function(err,result){
        res.json(result)
    })
    }
)
router.get("/InstructorOfCourse/:InstId",async function(req,res)
{
    var instId = req.params.InstId;
    var query = await Instructor.findOne({id:instId});
            res.json({name:query.Name});
        
    
    }
)

router.get("/CourseisEnrolled/:CourseId/:UserId",async function(req,res)
{
    var CourseId = req.params.CourseId;   
    var UserId =req.params.UserId;
    var result = await Trainee.find({id:UserId})
    for(var i=0;i<result[0].courses.length;i++){
        if(CourseId==result[0].courses[i].id)
            res.json(true);
        else{
            res.json(false);
        }
    }

    }
)
router.post("/deleteSubtitle/:id/:subtitle",async function(req,res){
    var id=req.params.id;
    var subtitle=req.params.subtitle;
    var course=await Course.findOne({id:id});
    var arr=course.subtitles;
    var arr2=course.excercises;
    var final=[];
    var hours=0
    var index=0;
    var finalExcer=[];
    for(var i=0;i<arr.length;i++){
        if(arr[i].title!=subtitle){
            final=final.concat([arr[i]])
        }else{
            hours=Number(arr[i].hours)
            index=arr[i].excerciseId;
        }
    }
    for(var i=0;i<arr2.length;i++){
        if(arr2[i]!=index){
            finalExcer=finalExcer.concat([arr2[i]])
        }
    }
    
    await Course.findOneAndUpdate({id:id},{subtitles:final,hours:Number(course.hours)-hours,excercises:finalExcer})
    await Excercise.deleteOne({id:index})
    res.json(final)
})
router.post("/updateSubtitle/:id/:oldtitle/:title/:hours/:link/:desc",async function(req,res){
    var id=req.params.id
    var title=req.params.title;
    var oldtitle=req.params.oldtitle
    var hours=Number(req.params.hours);
    var link=req.params.link
    var description=req.params.desc
    var course=await Course.findOne({id:id})
    var subtitles=course.subtitles
    var finalSub=[];
    var oldhours=0
    var newhours=0
    // console.log(link)
    for(var i=0;i<subtitles.length;i++){
        if(subtitles[i].title != oldtitle){
            finalSub=finalSub.concat([subtitles[i]])
        }else{
            oldhours=subtitles[i].hours
            var object={video:[subtitles[i].video[0]],lesson:subtitles[i].lesson,description:subtitles[i].description,title:subtitles[i].description,hours:oldhours}
            if(title != "-1"){
                object.title=title;
            }
            if(link != "-1"){
                object.video=[link];
            }
            if(hours != "-1"){
                object.hours=Number(hours);
                newhours=Number(hours)
                
            }
            if(description != "-1"){
                object.description=description;
            }
            finalSub=finalSub.concat([object])
        }
    }
    
    await Course.findOneAndUpdate({id:id},{subtitles:finalSub,hours:Number(course.hours)-Number(oldhours)+Number(newhours)})
    res.json("ok")
})

router.get("/PopularCourses",async function(req,res){
    var result=await Course.find({published:true,closed:false});
    var enrollArr=result.map((course)=>course.enrolledStudents)
    enrollArr=enrollArr.sort();

    var final=enrollArr.splice(enrollArr.length-3,enrollArr.length);

    var finalCourses=[];
    let uniqueEnrolled = [...new Set(final)];
    for(var i=0;i<uniqueEnrolled.length;i++){
        var course=await Course.find({enrolledStudents:uniqueEnrolled[i],published:true,closed:false})
        if(!finalCourses.includes(course))
        finalCourses=finalCourses.concat(course)
    }
    res.json(finalCourses)
})
router.get("/allPromoted", async function(req,res){
    var query= await Course.find({published:true,closed:false});
    // @ts-ignore
    var array= [];
    for(i=0;i<query.length;i++){
        var d1 = new Date();
        if(query[i].discount.amount>0){
            if(query[i].discount.EndDate)
            {
                var d2 = new Date(query[i].discount.EndDate)
       
                if(d2.getTime()>d1.getTime()){
                    
                array = array.concat([query[i]]);
                }
            }
        }
    }
    res.json(array);
})
module.exports=router