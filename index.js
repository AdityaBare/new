const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:"delta_app",
    password:'b@re2629'
});
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.set('view engine','ejs');
app.set('views',path.join(__dirname ,'/views'));
app.use(express.static(path.join(__dirname,'/public')));


let createRandomUser =()=> {
    return [
       faker.string.uuid(),
       faker.internet.username(), // before version 9.1.0, use userName()
       faker.internet.email(),
       faker.internet.password(),
    ];
  }


let q = ' INSERT INTO temp (id,name, email,password) VALUES ?';
let data = [];

for(let i=0;i<100;i++){
    data[i]=createRandomUser();
}




// connection.query(
//     q,[data],(err,result)=>{
//         try{
//             if(err) throw err;
//             console.log(result);
//         }catch(err){
//             console.log(err);
//         }
//                }
// );



// connection.end();


// HOME ROUT
app.get('/',(req,res)=>{
let q = 'SELECT COUNT(*) FROM temp';

connection.query(q,(err,result)=>{
    try{
        if (err) throw err;
        let count =result[0] ['COUNT(*)'];
        res.render('index.ejs', {count});
        console.log(result[0] ['COUNT(*)']);
    }catch(err){
        console.log(err);
        res.send("Some error")
    }
})

   
})

// USER ROUT
app.get("/user",(req,res)=>{
try{
    let q= 'SELECT * FROM temp';
    connection.query(q,(err,result)=>{
        res.render('user.ejs',{result});
        console.log(result[0]);
    })
   

}catch(err){
    res.send('Some error');
}
});

// EDIT ROUT 

app.get('/edit/:id',(req,res)=>{

    let {id}= req.params;
    let q= `SELECT * FROM temp WHERE id='${id}'`;
    
    try{
        connection.query(q,{id},(err , result) =>{
            let userdata = result;
            res.render('edit.ejs',{userdata});
            console.log(userdata[0]['id']);   
        })
        
    }catch(err){
        console.log("Some thing is wrong");

    }

});
// UPDATE ROUTE

app.patch('/user/:id',(req,res)=>{
    let {id}=req.params;
    let q= `SELECT * FROM temp WHERE id ='${id}'`;

    

    let {name:newname,password:formPass}=req.body;
    let more = req.body;
   try{
     connection.query(q,{id},(req,result)=>{
        let user = result[0];

        if( formPass!= user.password){
            res.send("Wrong pass",formPass,user.password);
            console.log("Wrong pass",formPass,user.password);
            console.log(more);
           
        }
        else{
           let q2 = `UPDATE temp SET name = '${newname}' WHERE id ='${id}'`;
           connection.query(q2,(err,result)=>{
            if(err) throw err;
            let count = result;
            
            res.redirect('/user');
           })
        }
     })
   }catch{

   }


});
// ADD
app.get("/join",(req,res)=>{
       res.render('join.ejs');
    

});
app.post("/add",(req,res)=>{
    let {name,email,password}= req.body;
    let id = uuidv4();
    let q = 'INSERT INTO temp (id,name,email,password) VALUES (?,?,?,?)';
     connection.query(q,[id,name,email,password],(err,result)=>{
        // if (err) {
        //     console.error("Database error:", err);
        //     return res.status(500).send("Insert failed");
        //   }
      console.log(result);
     console.log(id,name,email,password);

     res.redirect('/');

     })


})

app.listen(port,()=>{
    console.log(`On port ${port}`);
});
