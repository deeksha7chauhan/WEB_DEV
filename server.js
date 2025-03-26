const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
//middleware in Express.js that parses incoming request bodies before they reach your route handlers. 
//It allows you to extract data from the request body (usually sent as JSON, form data, or raw text) and make it accessible via req.body
//It is needed for handling POST and PUT requests with JSON or form data.
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
//When a client sends data in the request body (e.g., via POST or PUT requests), Express does not process this data by default.
//Without body-parser, req.body would be undefined, and we wouldn’t be able to read the request payload.

const db = new sqlite3.Database('./users.db', (err) =>
{
    if (err)
    {
        console.error('Error opening the db', err.message);
    }

    else{
        console.log('Successfully connected to the database!!');
        db.run(`Create Table if not exists users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, 
            age INTEGER NOT NULL)`);
    }
});

//GET /users - Fetch all the users present in the database.

app.get('/users', (req, res) =>
{
    db.all('SELECT * FROM users', [], (err, rows) =>
    {
        if(err)
        {
            res.status(500).json({message: 'Error retriving users'});
            return;
        }
        res.json({users: rows});
    });
});

app.post('/users', (req, res) =>
{
    const {name , age} = req.body;
    if(!name || !age)
    {
        return res.status(400).json({message: "Please enter all fields"});
    }

    db.run('INSERT INTO users (name, age) VALUES (?,?)', [name, age], (err) =>
    {
        if(err)
        {
            res.status(500).json({message: 'Error with the db while adding the user'})
            return;
        }
        res.status(201).json({message: 'User created successfully'});
    });
});

app.put('/users/:id', (req, res) =>
{
    const{id} = req.params;
    const{name, age} = req.body;
    if (!name && !age) {
        return res.status(400).json({ message: "Provide at least one field to update" });
    }
    let fields =[];
    let values =[];
    if(name)
    {
        fields.push('name = ?');
        values.push(name);
    }
    if(age)
    {
        fields.push('age = ?');
        values.push(age);
    }
    values.push(id);
    const Query = `UPDATE users SET ${fields.join(",")} where id = ?`;
    
    db.run(Query, values, err =>
    {
        if(err)
        {
            res.status(500).json({message: 'Error with the db while updating the user'});
            return;
        }
        if(this.changes ===0)
        {
            return res.status(404).json({message: 'User not found'});
        }
        res.json({message: 'User updated successfully'});
    });
});

app.delete('/users/:id', (req, res) =>
{
    const{id} = req.params;

    db.run('DELETE from users where id =?', [id], (err) =>
    {
        if(err)
        {
            res.status(500).json({message: 'Error with the db while deleting the user'});
            return;
        }
        if( this.changes ===0)
        {
            return res.status(404).json({message: 'User not found'});
        }
        res.json({message: 'User deleted successfully'});

    });

});

app.get('/', (req, res) =>
{
    res.send('Hello users');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

