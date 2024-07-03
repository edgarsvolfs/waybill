const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
//const User = require('./public/js/userSchema'); // path to your User model
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFSBucket = require('mongodb').GridFSBucket;
const fs = require('fs');
const { MongoClient } = require('mongodb');
// const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './values.env' });

const secretKeyEnv = process.env.secretKey;
const MONGODB_URIEnv = process.env.MONGODB_URI;
const secretEnv = process.env.secret;
const clientIDEnv = process.env.ClientID;
const clientSecretEnv = process.env.clientSecret;

const secretKey = secretKeyEnv;  // Change this to a secure key



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can set specific origins instead of '*' for security
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, content-disposition'); // Include content-disposition here
  next();
});





//app.use(cors(corsOptions));

const MONGODB_URI = MONGODB_URIEnv;

mongoose.connect(MONGODB_URI, {
});

const upload = multer();

const dbName = 'test'; // Your database name
const client = new MongoClient(MONGODB_URI, {});

client.connect();
console.log('Connected to MongoDB');

const db = client.db(dbName);
const bucket = new GridFSBucket(db, {
  bucketName: 'fs' // This is the default bucket name for GridFS
});

const corsOptions = {
  origin: 'http://localhost:8000', // Replace with your client's origin
  credentials: true, // This allows the server to accept credentials in the request
  allowedHeaders: ['Content-Type', 'Authorization', 'content-disposition'], // Include other headers if needed
};

app.use(session({
  secret: secretEnv,
  resave: false,
  saveUninitialized: false
}));
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
// app.use(cookieParser());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: clientIDEnv,
  clientSecret: clientSecretEnv,

  callbackURL: "http://localhost:8000/auth/google/callback"
},
  function (accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));




app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function (req, res) {
  req.session.user = req.user;

  // Save the session before redirecting
  req.session.save(function (err) {
    if (err) {
      console.log(err);
      return res.redirect('/index');
    }
    res.redirect(302, '/userInfo');
  });
});



app.get('/userInfo', async (req, res) => {
  // Access the user information from session
  const users = await db.collection('userAccess').find().toArray();
  const user = req.session.user;
  const userFullName = `${user.name.givenName} ${user.name.familyName}`;
  // Check if user is undefined before rendering the page
  if (!user) {
    return res.status(403).json({ error: 'Kļūda pieslēdzoties' });
  }
  const hasAccess = users.some(user => `${user.name} ${user.surname}` === userFullName);
  if (!hasAccess) {
    console.log(userFullName);
    return res.status(403).json({ error: 'Nav piešķirta pieeja' });
  }
  console.log(user.name.givenName);
  console.log(user.name.familyName);

  res.cookie('name', user.name.givenName);
  res.cookie('surname', user.name.familyName);
  res.redirect('mainPage.html');
});


// Endpoint to add a new user
app.post('/addUser', async (req, res) => {
  const { name, surname } = req.body;
  try {
    await db.collection('userAccess').insertOne({ name, surname });
    res.status(200).json({ message: 'User added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Endpoint to delete a user
app.delete('/deleteUser', async (req, res) => {
  const { name, surname } = req.body;
  try {
    await db.collection('userAccess').deleteOne({ name, surname });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});





app.get('/listUsers', async (req, res) => {
  try {
    const users = await db.collection('userAccess').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


app.get('/generateToken', (req, res) => {
  const filename = req.query.filename;

  // Validate the filename and user's permission to access the file (your logic)
  if (!filename) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Generate a secure token
  const token = jwt.sign({ filename: filename }, secretKey, { expiresIn: '1h' });

  res.json({ token: token });
});

app.get('/getFilename', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Missing token');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }

    // Return the filename
    res.json({ filename: decoded.filename });
  });
});






app.get('/uploadFile', function (req, res) {
  // Access the user information from session
  const user = req.session.user;

  // Check if user is undefined before rendering the page
  if (!user) {
    // Handle the case where user is undefined (e.g., redirect to login page)
    return res.redirect('/');
  }

  res.cookie('name', user.name.givenName);
  res.cookie('surname', user.name.familyName);
  // Render the uploadFile page and pass the user information
  res.redirect('mainPage.html');
});


app.post('/update/:filename', upload.single('file'), async (req, res) => {
  try {
    console.log('Starting update process...');

    const blob = req.file.buffer;
    const filename = req.params.filename; // Use the parameter from the URL
    console.log('Received filename:', filename);

    // Check if the filename already exists in the database
    const existingFile = await bucket.find({ filename: filename }).limit(1).next();
    console.log('Existing file:', existingFile);

    if (existingFile) {
      // Delete the existing file
      await bucket.delete(existingFile._id);

      // Upload the new file with the updated metadata
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: 'application/pdf',
        metadata: req.body
      });
      uploadStream.end(blob);

      uploadStream.on('finish', () => {
        console.log('File content replaced successfully.');
        res.status(200).json({ message: 'File updated successfully' });
      });
    } else {
      // Handle case where file does not exist
      return res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const blob = req.file.buffer;
    const count = await bucket.find().count();
    const fileName = `${count}`; // Generate a unique filename
    //const fileName = `Pavadzime_${count}.pdf`; // Generate a unique filename


    // console.log('filename ', fileName);
    // console.log('metadata in server.js ', req.body);

    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: 'application/pdf',
      metadata: {
        //randomSmth: 'works',
        ...req.body
      }
    });

    // Write the file buffer to GridFS
    uploadStream.end(blob);

    uploadStream.on('finish', () => {
      console.log('The file has been saved to GridFS!');
      res.status(200).json({ message: 'File uploaded successfully', fileId: uploadStream.id });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/filesCount', async (req, res) => {
  const count = await bucket.find().count();
  res.json({ count: count });
});



app.post('/files', async (req, res) => {
  try {
    const filename = req.body.filename;
    console.log('Requested filename:', filename);

    const file = await bucket.find({ filename }).limit(1).next();

    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.contentType === 'application/pdf') {
      const readstream = bucket.openDownloadStreamByName(file.filename);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      readstream.pipe(res);
    } else {
      res.status(404).json({ message: 'Not a PDF file' });
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    //await client.close();
  }
});



app.get('/metadata/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const file = await bucket.find({ filename }).limit(1).next();

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file.metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/isAdmin', async (req, res) => {
  const admins = await db.collection('admins').find().toArray();
  const requestData = req.body;
  const userFullName = `${requestData.name} ${requestData.surname}`;
  const isAdmin = admins.some(admin => `${admin.name} ${admin.surname}` === userFullName);

  res.json({ isAdmin: isAdmin });
});






app.post('/test', async (req, res) => {
  const files = await bucket.find().toArray();
  const admins = await db.collection('admins').find().toArray();
  const count = files.length;
  const itemsData = [];
  const requestData = req.body;
  // Handle the requestData
  //console.log('Received data:', requestData);
  const userFullName = `${requestData.name} ${requestData.surname}`;
  const isAdmin = admins.some(admin => `${admin.name} ${admin.surname}` === userFullName);




  if (!requestData) {
    return res.redirect('/');
  }

  files.sort((a, b) => {
    // Extract numbers from filenames
    const numA = parseInt(a.filename.match(/\d+/)[0], 10);
    const numB = parseInt(b.filename.match(/\d+/)[0], 10);

    // Compare numbers in descending order
    return numB - numA;
  });

  files.forEach(file => {
    if (file.metadata.createdBy !== userFullName && isAdmin !== true) {
      return;
    }
    const newItem = {
      name: file.filename,
      date: file.metadata.dateSubmitted,
      sum: file.metadata.costSum,
      createdBy: file.metadata.createdBy,
      reciever: file.metadata.reciever,
      sum_without_VAT: file.metadata.sum_without_VAT,
      vat_amount: file.metadata.vat_amount

    };
    itemsData.push(newItem);

  });

  res.json({ itemsData: itemsData });
});



app.listen(process.env.port || 8000, () => console.log('listening on port ${port}'));
