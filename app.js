// Importing express module
const express  = require('express')
// Importing body parser
const bodyParser = require('body-parser')

// Importing path module for file path (it is a core module)
const path = require('path')

//Initialize variable to the express function
const app = express()

//Using the npm express validator for validation of user input
const validator = require('express-validator')

//Using the npm mongo db module to store the users in the database and also retrieve user from database.
const mongo = require('mongojs')

//Reference to the database customer app and collections users
const db = mongo("customerapp",["users"])

const objectId = mongo.ObjectId

/*//Creating custom middleware
const logger = function(req,res,next){
  console.log('Logging..')
  next();
}

//It will use the logger middleware
app.use(logger)*/


//View Engine
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

//BodyParser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//Set Static path
app.use(express.static(path.join(__dirname,'public')))

//Global variables
app.use(function(req,res,next){
  res.locals.errors = null
  next()
})

//Express Validator Middleware
app.use(validator({
  errorFormatter:function(param,msg,value){
    let namespace = param.split('.'),
    root = namespace.shift(),
    formParam  = root

    while(namespace.length){
      formParam += '['+namespace.shift()+']'
    }
    return {
      param: formParam,
      msg:msg,
      value:value
    }

  }

}))

let users = [
  {
    firstName: "John",
    lastName: "Doe",
    email:"john234@gmail.com"
  },
  {
    firstName: "Mark",
    lastName: "Stuart",
    email:"marks@gmail.com"
  },
  {
    firstName: "Sam",
    lastName: "Smith",
    email:"samsmith@gmail.com"
  }
]

//Routes to handle the get request
app.get('/',function(req,res){

  // retrieve the users from the mongo database
  db.users.find(function(err,users){
    res.render('index',{
      title:'customers',
      users:users
    })
  })

  
 
})

app.post('/users/add',function(req,res){
 

    req.checkBody('first_name','First Name is required').notEmpty()
    req.checkBody('last_name','Last Name is required').notEmpty()
    req.checkBody('email','Email is required').notEmpty()
  
    const errors = req.validationErrors()
    if(errors){

      res.render('index',{
        title:'customers',
        users:users,
        errors:errors
      })
    }else{
      const newUser = {
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        email:req.body.email
      }
      //users.push(newUser)
      db.users.insert(newUser,function(err,result){
        if(err){
          console.log(err)

        }
       res.redirect('/')
      })
    }
    
  
})

app.delete('/users/delete/:id',function(req,res){

  db.users.remove({_id:objectId(req.params.id),function(err,result){
    if(err){
      console.log(err)
   }
    res.redirect('/')
  }})
})

//
app.listen(3000,function(){
  console.log('Server started on Port 3000...')
})
