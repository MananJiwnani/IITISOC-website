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

mongoose.connect('mongodb+srv://jonty:ic1HDE142HxSTHZf@cluster0.tluj8rn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

const User = require('./user');
const Property = require('./property');
const mRequest= require('./maintenanceReq');

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

const userRoutes = require('./userRoute');
app.use('/login',userRoutes);
app.use('/home',userRoutes);
app.use('/login',userRoutes);
app.use('/auth/google',userRoutes);
app.use('/auth/google/callback',userRoutes);

app.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
}));

app.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/success', 
		failureRedirect: '/failure'
}));

app.get('/success', (req, res) => {
	if(!req.user) {
		res.redirect('/failure');
  }
	// res.send("Welcome " + req.user.email);
  res.redirect('/');
});

app.get('/failure', (req, res) => {
  res.send("ERROR");
});

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
  const { name, email, contact,password, role,owner,tenant } = req.body;
  const user = new User({ name, email, contact, password, role,owner,tenant })
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
    const message =req.session.message;
    delete req.session.message;
    res.render('tenant_portal.ejs', {tenant,info: message});
  } catch (error) {
      res.status(500).send('Internal server error');
    }
});

app.get('/message',checkAuth,async(req, res) => {
  const uname=req.session.username;
  res.render('message.ejs',{
    uname,
  });
});

app.get('/my_tenants',checkAuth, async(req, res) => {
  try {
    let rentals = await Property.find({ owner: req.session.user_id }).exec();
    const tenantPromises = rentals.map(async (property) => {
      const tenant = await User.findById(property.tenant).exec();
      return { ...property.toObject(), tenant };
    });
    const propertiesWithTenant = await Promise.all(tenantPromises);
    const hasTenants = propertiesWithTenant.some(property => property.tenant);

    res.render('my_tenants.ejs', { properties: propertiesWithTenant, hasTenants });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/my_owners',checkAuth, async(req, res) => {
  try {
    let rentals = await Property.find({ tenant: req.session.user_id }).exec();
    const ownerPromises = rentals.map(async (property) => {
      const owner = await User.findById(property.owner).exec();
      return { ...property.toObject(), owner };
    });
    const propertiesWithOwner = await Promise.all(ownerPromises);

    res.render('my_owners.ejs', { properties: propertiesWithOwner });
  } catch (err) {
    res.status(500).send(err);
  }
});
 
app.get('/tenant_req',checkAuth, (req, res) => {
  res.render('tenant_req.ejs');
});

app.get('/rent_estimate',checkAuth, (req, res) => {
  res.render('rent_estimate.ejs');
});

app.get('/tenant_properties',checkAuth, async(req, res) => {
  try {
    let rentals = await Property.find({ tenant: req.session.user_id }).populate(['propertyType', 'subCategory', 'address', 'city', 'state', 'price']);
    res.render('tenant_properties.ejs', { properties: rentals });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/tenant_properties/:id', checkAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const properties = await Property.findById(propertyId).populate('owner');
   
    const email = properties.owner.email;
    const rented = properties.rentedOut;

    const userId = req.session.user_id;
    const room_id=userId;
    const tenant = await User.findById(userId);
    const user = await User.findById(userId);
    const role = user.role;
    
    if (!properties) {
      return res.status(404).send('Property not found');
    }

    res.render('property.ejs', { 
      property: properties, 
      ROLE: role,
      rented,
      tenant,
      rented,
      email,
      room_id
    });
  }
   catch (error) {
    res.status(500).send('Internal server error');
  }
});



app.get('/my_owners/:id', checkAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const properties = await Property.findById(propertyId).populate('owner');
   
    const email = properties.owner.email;
    const rented = properties.rentedOut;

    const userId = req.session.user_id;
    const room_id=userId;
    const tenant = await User.findById(userId);
    const user = await User.findById(userId);
    const role = user.role;
    
    if (!properties) {
      return res.status(404).send('Property not found');
    }

    res.render('property.ejs', { 
      property: properties, 
      ROLE: role,
      rented,
      tenant,
      rented,
      email,
      room_id
    });
  }
   catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.get('/my_tenants/:id', checkAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const properties = await Property.findById(propertyId).populate('owner');
   
    const email = properties.owner.email;
    const rented = properties.rentedOut;

    const userId = req.session.user_id;
    const room_id=userId;
    const tenant = await User.findById(userId);
    const user = await User.findById(userId);
    const role = user.role;
    
    if (!properties) {
      return res.status(404).send('Property not found');
    }

    res.render('property.ejs', { 
      property: properties, 
      ROLE: role,
      rented,
      tenant,
      rented,
      email,
      room_id
    });
  }
   catch (error) {
    res.status(500).send('Internal server error');
  }
});


app.get('/vacancies/:id', checkAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const properties = await Property.findById(propertyId).populate('owner');
    const rented = properties.rentedOut;
    const email = properties.owner.email;
    const userId = req.session.user_id;
    const room_id=userId;
    const tenant = await User.findById(userId);
    const user = await User.findById(userId);
    const role = user.role;
    if (!properties) {
      return res.status(404).send('Property not found');
    }

    res.render('property.ejs', { 
      property: properties, 
      ROLE: role, 
      rented,
      tenant,
      email,
      room_id
    });
  }
   catch (error) {
    res.status(500).send('Internal server error');
  }
});

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
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const propertyId = req.body.property_id;
        const property = await Property.findById(propertyId);
        
        res.status(200).send({
          success: true,
          msg: 'PAYMENT INITIATED AND TENANT ASSIGNED',
          order_id: order.id,
          amount: amount, 
          key_id: RAZORPAY_ID_KEY,
          product_name: req.body.name,
          image: property.image.path,
          contact: user.contact,
          name: user.name,
          email: user.email,
          property_id: req.body.property_id,
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

app.post('/updateTenant', checkAuth, async (req, res) => {
  try {
    const userId = req.session.user_id;
    const propertyId = req.body.property_id;
    console.log('Updating property:', propertyId, 'with tenant:', userId);

    await Property.findByIdAndUpdate(propertyId, { tenant: userId, rentedOut: true });
    console.log('Updated property:', propertyId);

    res.status(200).send({ success: true, msg: 'TENANT ASSIGNED SUCCESSFULLY' });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, msg: 'Internal Server Error' });
  }
});

app.post('/unRent', checkAuth, async(req, res) => {
  try {
    const propertyId = req.body.property_id;
    await Property.findByIdAndUpdate(propertyId, { rentedOut: false, tenant: null });
    req.session.unrented = "unrented";
    res.redirect('/myProperties');
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, msg: 'Internal Server Error' });
  }
});


 
// My properties page for owner to see his properties
app.get('/myProperties',checkAuth, checkRole('owner'), async(req, res) => {
  try {
    let rentals = await Property.find({ owner: req.session.user_id }).populate(['subCategory', 'propertyType', 'address', 'city', 'state', 'price']);
    // rentals = JSON.stringify(rentals);
    const message = req.session.unrented;
    req.session.unrented = null;

    const hasTenants = rentals.some(property => property.tenant);
    const allHaveTenants = rentals.every(property => property.tenant);
    res.render('myproperties.ejs', { properties: rentals, message: message, hasTenants, allHaveTenants });
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


app.get('/request',checkAuth,checkRole('owner'), async(req, res)=> {
  try{
    const userId= req.session.user_id;
    const owner = await User.findById(userId);
    
   const maintenanceRequests=await mRequest.find({owner: userId});
   const message =req.session.message;
   delete req.session.message;
   res.render('request.ejs',{owner,maintenanceRequests,info:message});
   }
   catch (error) {
   res.status(500).send('Internal server error');
  }
      }  );

app.get('/request/:id', checkAuth, async (req, res) => {
  try {
    const maintenanceRequestId = req.params.id;
    const maintenanceRequests = await mRequest.findById(maintenanceRequestId).populate('tenant');
    
    if (!maintenanceRequests) {
      return res.status(404).send('Request not found');
    }

    res.render('mRequest.ejs', { request:maintenanceRequests });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.get('/maintenanceRequest',checkAuth, (req, res) => {
  const propertyId = req.query.property_id;
  res.render('AddRequest.ejs', { propertyId });
});

app.post('/maintenanceRequest', checkAuth, async (req, res) => {
  try {
    const tenantId = req.session.user_id;
    const tenant = await User.findById(tenantId);
    const email=tenant.email;
    
    const propertyId = req.body.property_id;
    const properties = await Property.findById(propertyId).populate('owner');
    
    const ownerId=properties.owner._id;
    const newRequest = new mRequest({
      tenant: tenantId,
      owner: ownerId,
      email:email,
      tenantName: req.body.tenantName,
      propertyType: req.body.propertyType,
      subCategory: req.body.subCategory,
      address: req.body.address,
      subject: req.body.subject,
      description: req.body.description,
      date:req.body.date,
      
      status: 'Pending',
    });
    
    await newRequest.save();
    req.session.message = 'Request Sent Successfully';
    res.redirect('/tenant_portal');
  } catch (err) {
    res.status(500).send(err);
   
  }
});

app.post('/resolveRequest', checkAuth, checkRole('owner'), async (req, res) => {
  try {
    const requestId = req.body.requestId;
    const maintenanceRequest = await mRequest.findById(requestId);

    maintenanceRequest.status = 'Completed';
    await maintenanceRequest.save();

    req.session.message = 'Request resolved successfully';
    res.redirect('/request');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.get('/rentalIncome', checkAuth, checkRole('owner'), async (req, res) => {
  try {
    const userId = req.session.user_id;
    const properties = await Property.find({ owner: userId, rentedOut: true  }).populate('tenant');
    const totalRentalIncome = properties.reduce(
      (total, property) => total + property.price, 0);

    const rentalIncome = properties.map(property => {
      return {
        propertyType:property.propertyType,
        subCategory:property.subCategory,
        address: property.address,
        rent: property.price,
        tenant: property.tenant.name ,
        rentedOut: property.rentedOut
      };
    });

    res.render('rentalIncome.ejs', { rentalIncome ,totalRentalIncome });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
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
