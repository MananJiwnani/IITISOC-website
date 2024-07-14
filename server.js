if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const http = require('http');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
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
// const upload = require("./storage");

// mongoose.connect('mongodb://localhost:27017/userDb').then(() => {
//   console.log('Connected to MongoDB');
// }).catch(err => {
//   console.error('Failed to connect to MongoDB', err);
//   process.exit(1);
// });
mongoose.connect('mongodb://localhost:27017/userDb').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

const User = require('./user');
const Property = require('./property');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));
const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

const paymentRoute = require('./paymentRoute');
const Razorpay = require('razorpay');
app.use('/vacancies', paymentRoute);

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

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

app.get('/vacancies',checkAuth, async(req, res) => {
  try{
    const query = req.session.query || {};
    let vacancies = await Property.find(query).populate(['subCategory', 'propertyType', 'address', 'city', 'state', 'price']);
    res.render('vacancies.ejs', {
      userId: req.session.user_id,
      properties: vacancies
    });
  } catch(err){
    res.status(500).send(err);
  }
});

app.get('/property',checkAuth, async(req, res)=> {
   try{
   const properties=await Property.find();
   res.render('property.ejs',{properties});
   }
   catch (error) {
   res.status(500).send('Internal server error');
  }
      }  );

app.post('/createOrder',checkAuth, async(req, res)=> {
  try {
    const amount = req.body.price*100
    const options = {
        amount: amount,
        currency: 'INR',
        receipt: 'razorUser@gmail.com'
    }

    razorpayInstance.orders.create(options, async (err, order) => {
      if (!err) {
        const userId = req.session.userId;
        const propertyId = req.body.property_id;
        await Property.findByIdAndUpdate(propertyId, { tenant: userId });

        res.status(200).send({
          success: true,
          msg: 'PAYMENT INITIATED AND TENANT ASSIGNED',
          order_id: order.id,
          amount: amount, 
          key_id: RAZORPAY_ID_KEY,
          product_name: req.body.name,
          contact: "9515350605",
          name: "Tanmai Sai",
          email: "tanmaisaich@gmail.com"
        });
      } else {
        console.error('Error creating Razorpay order:', err);
        res.status(400).send({ success: false, msg: 'Something went wrong!' });
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: false, msg: 'Internal Server Error' });
  }
});    

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

app.get('/tenant_portal',checkAuth, checkRole('tenant'), async(req, res) => {
  try {
    const userId = req.session.user_id;
    const tenant = await User.findById(userId);
    res.render('tenant_portal.ejs', {tenant});
  } catch (error) {
      res.status(500).send('Internal server error');
    }
});

app.get('/login', (req, res) => {
  const error = req.flash('error');
  const uname=req.session.username;
  res.render('login.ejs', { 
    error,
    uname,
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
      req.session.username=foundUser.name;

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

app.get('/message',checkAuth,async(req, res) => {
  const uname=req.session.username;
  res.render('message.ejs',{
    uname,
  });
});

app.get('/my_tenants',checkAuth, (req, res) => {
  res.render('my_tenants.ejs');
});

app.get('/my_owners',checkAuth, (req, res) => {
  res.render('my_owners.ejs');
});
 
app.get('/tenant_req',checkAuth, (req, res) => {
  res.render('tenant_req.ejs');
});

app.get('/rent_estimate',checkAuth, (req, res) => {
  res.render('rent_estimate.ejs');
});

app.get('/tenant_properties',checkAuth, (req, res) => {
  res.render('tenant_properties.ejs');
});

app.get('/register', (req, res) => {
  const error = req.flash('error');
  const uname=req.session.username;
  res.render('register.ejs', { 
    error,
    uname,
    userId: req.session.user_id,
   
  });
});

// Saving the details and creating a new document/object in the 'User' collection
app.post('/register', checkNotAuth, async (req, res) => {
  const { name, email, contact,password, role } = req.body;
  const user = new User({ name, email, contact, password, role })
  await user.save();
  req.session.ROLE= role;
  req.session.username=name;
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

app.post('/addproperties', upload.single('image'), async (req, res, next) => {
    try {
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        
        var obj = {
            owner: req.session.user_id,
            ownerName: req.body.ownerName,
            price: req.body.price,
            address: req.body.address,
            city: req.body.city.toUpperCase(),
            state: req.body.state.toUpperCase(),
            propertyType: req.body.propertyType.toUpperCase(),
            subCategory: req.body.subCategory.toUpperCase(),
            carpetArea: req.body.carpetArea,
            amenities: req.body.amenities,
            description: req.body.description,
            propertyAge: req.body.propertyAge,
            ownershipType: req.body.ownershipType,
            furnishedStatus: req.body.furnishedStatus,
            petPolicy: req.body.petPolicy,
            image: {
                data: fs.readFileSync(filePath),
                contentType: req.file.mimetype,
                path: `/uploads/${req.file.filename}`
            }
        };
        await Property.create(obj);
        req.session.message = 'Property saved successfully';
        res.redirect('/owner_portal');
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving property.");
    }
});

app.get('/vacancies/:id', checkAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const properties = await Property.findById(propertyId);
    
    if (!properties) {
      return res.status(404).send('Property not found');
    }

    res.render('property.ejs', { property: properties});
  } catch (error) {
    res.status(500).send('Internal server error');
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
app.get('/api/username', checkAuth, (req, res) => {
  const uname = req.session.username;
  res.json({ uname });
});



io.on("connection",function(socket) {
  
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("newUser",function (uname,room){
   socket.to(room).emit("update", uname + " joined the conversation");
   console.log(`User Connected: ${socket.id}`);
  });

  socket.on("exitUser", function(uname, room) {
    socket.to(room).emit("update", uname + " left the conversation");
  });

  socket.on("chat", function(message, room) {
    socket.to(room).emit("chat", message);
  });

});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
