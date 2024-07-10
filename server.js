if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const path=require('path');
const {Server}=require("socket.io");
const io=new Server(server);

const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const Grid = require("gridfs-stream");
const { GridFsStorage } = require('multer-gridfs-storage');
const connection = require("./db");
const upload = require("./storage");

// mongoose.connect('mongodb://localhost:27017/userDb').then(() => {
//   console.log('Connected to MongoDB');
// }).catch(err => {
//   console.error('Failed to connect to MongoDB', err);
//   process.exit(1);
// });
mongoose.connect('mongodb://localhost:27017/userDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

const User = require('./user');
const Property = require('./property');

let gfs;
connection();

const conn = mongoose.connection;
// conn.once("open", function () {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection("photos");
// });

conn.once("open", function () {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'photos'
  });
});

app.use("/file", (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    next();
  });
});

app.get("/file/:filename", async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.send("not found");
    }
});

app.delete("/file/:filename", async (req, res) => {
    try {
        await gfs.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occured.");
    }
});

const paymentRoute = require('./paymentRoute');
app.use(paymentRoute);

// 
app.set('view-engine','ejs');
app.set('views','views');
app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Authentication
// function which returns next if the user is authenticated
const checkAuth = (req, res, next) => {
  if (!req.session.user_id) {
      return res.redirect('/login')
  }
  next()
}

// function which returns next if the user is not authenticated
const checkNotAuth = (req,res,next) => {
  if(req.session.user_id){
      return res.redirect('/')
  }
  next()
}


app.get('/', (req, res) => {
  res.render('home.ejs', {userId: req.session.user_id});
});

// app.get('/vacancies',checkAuth, async(req, res) => {
//   try{
//     const query = req.session.query || {};
//     let vacancies = await Property.find(query).populate(['subCategory', 'propertyType', 'address', 'city', 'state', 'price']);
//     res.render('vacancies.ejs', {
//       userId: req.session.user_id,
//       properties: vacancies
//     });
//   } catch(err){
//     res.status(500).send(err);
//   }
// });

app.get('/vacancies', checkAuth, (req, res, next) => {
  next();
}, paymentRoute);

app.get('/property',checkAuth, async(req, res)=> {
   try{
   const properties=await Property.find();
   res.render('property.ejs',{properties});
   }
   catch (error) {
   res.status(500).send('Internal server error');
  }
      }  );
   


app.get('/owner_portal',checkAuth, checkRole('owner'), async (req, res) => {
  try {
    const userId = req.session.user_id;
    const owner = await User.findById(userId);
    const message =req.session.message;
    delete req.session.message;
    res.render('owner_portal.ejs', { 
      owner,
      info: message
    });
  } catch (error) {
      res.status(500).send('Internal server error');
    }
 });

app.get('/tenant_portal',checkAuth, checkRole('tenant'), (req, res) => {
  res.render('tenant_portal.ejs');
});

app.get('/login', (req, res) => {
  const error = req.flash('error');
  res.render('login.ejs', { 
    error,
    userId: req.session.user_id
  });
});

// Verifying the details filled by user in logi page using "findAndValidate"
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findAndValidate(email, password);
  if (foundUser) {
      req.session.user_id = foundUser._id;
      req.session.ROLE = foundUser.role;
      res.redirect('/');
  }
  else {
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Incorrect password');
      res.redirect('/login');
    } else {
      req.flash('error', 'No user with that email. Please register first.');
      res.redirect('/register');
    }
  }
}) 

app.get('/message',checkAuth, (req, res) => {
  res.render('message.ejs');
});

app.get('/my_tenants',checkAuth, (req, res) => {
  res.render('my_tenants.ejs');
});

app.get('/register', (req, res) => {
  const error = req.flash('error');
  res.render('register.ejs', { 
    error,
    userId: req.session.user_id
  });
});

// Saving the details and creating a new document/object in the 'User' collection
app.post('/register', checkNotAuth, async (req, res) => {
  const { name, email, contact,password, role } = req.body;
  const user = new User({ name, email, contact, password, role })
  await user.save();
  req.session.ROLE= role;
  res.redirect('/');
})

// Authorization 
// function which checks the role of user (owner/ tenant)
function checkRole(role) {
return function(req, res, next) {
    if (req.session.ROLE ==role) {
        return next();
    }
   else{
      res.status(403).send(`Unauthorized: Only ${role}s can access this page`);
   }
};
}

app.get('/', (req, res) => {
const error = req.flash('error');
res.render('home.ejs', { error });
});

app.get('/logout', checkAuth, (req, res) => {
  res.render('logout.ejs')
})

app.post('/logout',checkAuth, (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
})


// Adding Properties
app.get('/addproperties',checkAuth, checkRole('owner'), (req, res)=>{
  res.render('addproperties.ejs');
});

// app.post('/addproperties',checkAuth, checkRole('owner'), upload.single('image'), async (req, res) => {
//   try {
//       if (req.image) {
//         const imgUrl = `http://localhost:3000/file/${req.file.filename}`;
//         req.body.image = [imgUrl];
//       } else {
//           return res.status(400).send("You must select a file.");
//       }
//     const newProperty = new Property({
//       owner: req.session.user_id, 
//       ownerName: req.body.ownerName,
//       propertyType: req.body.propertyType.toUpperCase(),
//       subCategory: req.body.subCategory.toUpperCase(),
      
//       description: req.body.description,
//       city: req.body.city.toUpperCase(),
//       state: req.body.state.toUpperCase(),
     
//       address: req.body.address,
//       price: req.body.price,
//       amenities: req.body.amenities,
//       image: req.body.image,
//       rentedOut: false,
//       ownershipType: req.body.ownershipType,
//       furnishedStatus: req.body.furnishedStatus,
//       propertyAge: req.body.propertyAge,
//       petPolicy: req.body.petPolicy,
//       carpetArea: req.body.carpetArea,
       
//     });
//     const savedProperty = await newProperty.save();
//     req.session.propertyId = savedProperty._id;
//     req.session.message = 'Property saved successfully';
//     res.redirect('/owner_portal');
//     console.log('Property added successfully');
//   } catch (error) {
//       res.status(403).send(error.message);
//     }
// });

app.post('/addproperties', checkAuth, checkRole('owner'), (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (req.file) {
      const imgUrl = `http://localhost:3000/file/${req.file.filename}`;
      req.body.image = [imgUrl];
    } else {
      return res.status(400).send("You must select a file.");
    }
    const newProperty = new Property({
      owner: req.session.user_id, 
      ownerName: req.body.ownerName,
      propertyType: req.body.propertyType.toUpperCase(),
      subCategory: req.body.subCategory.toUpperCase(),
      description: req.body.description,
      city: req.body.city.toUpperCase(),
      state: req.body.state.toUpperCase(),
      address: req.body.address,
      price: req.body.price,
      amenities: req.body.amenities,
      image: req.body.image,
      rentedOut: false,
      ownershipType: req.body.ownershipType,
      furnishedStatus: req.body.furnishedStatus,
      propertyAge: req.body.propertyAge,
      petPolicy: req.body.petPolicy,
      carpetArea: req.body.carpetArea,
    });
    const savedProperty = await newProperty.save();
    req.session.propertyId = savedProperty._id;
    req.session.message = 'Property saved successfully';
    res.redirect('/owner_portal');
    console.log('Property added successfully');
  } catch (error) {
    res.status(403).send(error.message);
  }
});

// My properties page for owner to see his properties
app.get('/myProperties',checkAuth, checkRole('owner'), async(req, res) => {
  try {
    let rentals = await Property.find({ owner: req.session.user_id }).populate(['subCategory', 'propertyType', 'address', 'city', 'state', 'price']);
    // rentals = JSON.stringify(rentals);
    res.render('myproperties.ejs', { properties: rentals });
  } catch (err) {
    res.status(500).send(err);
  }
    
});

// for updating the "rentedOut" status of that property
app.post('/markAsRented', checkAuth, checkRole('owner'), async (req, res) => {
  try {
    const propertyId = req.body.propertyId;
    await Property.findByIdAndUpdate(propertyId, { rentedOut: true });
    res.redirect('/myProperties'); 
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/myProperties/:id',checkAuth, checkRole('owner'), async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log(`Received request to rent out property with ID: ${propertyId}`);
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { rentedOut: true },
      { new: true }
    );
    if (!updatedProperty) {
      return res.status(404).send('Property not found');
    }
    res.status(200).send('Property Rented Out Successfully');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// post request in home page when user selects the filter options for seeing vacancies
app.post('/',checkAuth, (req, res) =>{
  try{
    const query = {};
    if (req.body.city) query.city = req.body.city.toUpperCase();
    if (req.body.state) query.state = req.body.state.toUpperCase();
    if (req.body.country) query.country = req.body.country.toUpperCase();
    if (req.body.propertyType) query.propertyType = req.body.propertyType.toUpperCase();
    if (req.body.subCategory) query.subCategory = req.body.subCategory.toUpperCase();
    
    if (req.body.min_budget || req.body.max_budget) {
      query.price = {};
      if (req.body.min_budget) query.price.$gte = parseInt(req.body.min_budget, 10);
      if (req.body.max_budget) query.price.$lte = parseInt(req.body.max_budget, 10);
    }

    req.session.query = query;
    return res.redirect('/vacancies');
  } catch {
      res.render('home.ejs');
  }
});

// app.get('/api/vacancies',checkAuth, async (req, res) => {
//   try {
//     const query = req.session.query || {};
//     const properties = await Property.find(query);

//     res.status(200).json(properties);
//   } catch (error) {
//     res.status(404).send(error.message);
//   }
// });

// post request in vacancies page when user selects the filter options for seeing vacancies
app.post('/vacancies',checkAuth, (req, res) => {
  try{
    const query = {};
    if (req.body.city) query.city = req.body.city.toUpperCase();
    if (req.body.state) query.state = req.body.state.toUpperCase();
    if (req.body.country) query.country = req.body.country.toUpperCase();
    if (req.body.propertyType) query.propertyType = req.body.propertyType.toUpperCase();
    if (req.body.subCategory) query.subCategory = req.body.subCategory.toUpperCase();

    if (req.body.min_budget || req.body.max_budget) {
      query.price = {};
      if (req.body.min_budget) query.price.$gte = parseInt(req.body.min_budget, 10);
      if (req.body.max_budget) query.price.$lte = parseInt(req.body.max_budget, 10);
    }
  
    req.session.query = query;
    return res.redirect('/vacancies');
  } catch (error) {
      res.status(404).send(error.message);
  }
})

app.post('/api/vacancies/:id',checkAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.session.user_id; 
    const property = await properties.findById(propertyId);

    if (!property) {
      return res.status(404).send('Property not found');
    }
    res.status(200).send('Application sent successfully');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

io.on("connection",function(socket) {

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("newUser",function (name,room){
   socket.to(room).emit("update", name + " joined the conversation");
   console.log(`User Connected: ${socket.id}`);
  });

  socket.on("exitUser", function(name, room) {
    socket.to(room).emit("update", name + " left the conversation");
  });

  socket.on("chat", function(message, room) {
    socket.to(room).emit("chat", message);
  });

});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
