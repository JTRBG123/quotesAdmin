import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "mkorvuw3sl6cu9ms.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "wb17uxuv7sk7sb5q",
    password: "sz7xg1pq8ke9wvyt",
    database: "x3fxumwvttluosqc",
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', (req, res) => {
   res.render('home.ejs')
});

app.get('/authors', async (req, res) => {
   let sql = `SELECT authorId, firstName, lastName
              FROM authors
              ORDER BY lastName`;
    const [authors] = await pool.query(sql); 
    console.log(authors);              
   res.render('authors.ejs', {authors})
});

//Displays the form to update an existing author
app.get('/updateAuthor', async (req, res) => {
   let authorId = req.query.authorId;
   let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') ISOdob, DATE_FORMAT(dod, '%Y-%m-%d') ISOdod
              FROM authors
              WHERE authorId = ?`;
   const [authorInfo] = await pool.query(sql, [authorId]); 
   res.render('updateAuthor.ejs', {authorInfo})
});

app.post('/updateAuthor', async (req, res) => {
   let firstName = req.body.firstName;
   let lastName = req.body.lastName;
   let dob = req.body.dob;
   let sex = req.body.sex;
   let authorId = req.body.authorId;

   let sql = `UPDATE authors
              SET
              firstName = ?,
              lastName = ?,
              dob = ?,
              sex = ?
              WHERE authorId = ?
              `;
   let sqlParams = [firstName, lastName, dob, sex, authorId];              
   const [rows] = await pool.query(sql, sqlParams);
   res.redirect('/authors')
});

//route to display the form to add a new author
app.get('/addAuthor', (req, res) => {
   res.render('addAuthor.ejs')
});

//route to save the author info into the database
app.post('/addAuthor', async (req, res) => {

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let bio = req.body.bio;

    let sql = `INSERT INTO authors
               (firstName, lastName, dob, biography)
               VALUES
               (?, ?, ?, ?)`;
    let sqlParams = [firstName, lastName, dob, bio];

    const [rows] = await pool.query(sql, sqlParams);

   res.redirect('/');

});

//route to display the form to add a new quote
app.get('/addQuote', (req, res) => {

    //get list of authors
    //get list of categories

   res.render('addQuote.ejs')
});


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})