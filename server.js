  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  const express = require('express');
  const http = require('http');
  const app = express();
  const server = http.createServer(app);

  const path = require('path');
  const bcrypt = require('bcrypt');
  const passport = require('passport');
  const flash = require('express-flash');
  const session = require('express-session');
  const methodOverride = require('method-override');
  const mongoose = require('mongoose');

  const initializePassport = require('./passport');
  
  // mongoose.connect(process.env.MONGO_URI)
  // .then(() => console.log('Connected to MongoDB'))
  // .catch((err) => console.error('Error connecting to MongoDB:', err));
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = require('./user');
  const property = require('./property');
  
  initializePassport(
    passport,
    async email => await user.findOne({ email: email }),
    async id => await user.findById(id) 
  )
  
  app.set('view-engine','ejs');
  app.use(express.urlencoded({ extended: false }));
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
  
  // allow user to go to homepage even if he is not loggined
  // but make sure that he wont be able to access the 
  // search button(goes to vacancies page),owner portal,tenant portal.
  app.get('/',(req,res) => {
    res.render('home.ejs');
  });

  app.get('/vacancies', checkAuthenticated, (req, res) => {
    res.render('vacancies.ejs');
  });
  
  app.get('/ownerportal', checkAuthenticated, checkRole('owner'), (req, res) => {
    res.render('owner.ejs');
  });

  app.get('/tenantportal', checkAuthenticated, checkRole('tenant'), (req, res) => {
    res.render('tenant.ejs');
  });

  //myprofie is in owner portal
  app.get('/myprofile', checkAuthenticated, checkRole('owner'), (req, res) => {
    res.render('myprofile.ejs');
  });

  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
  });
  
  //submit button in login page should take to the home page
  app.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return res.redirect('/login'); 
      }
      req.logIn(user, (error) => {
        if (error) {
          return next(error);
        }
        req.session.userId = user._id; 
        return res.redirect('/');
      });
    })(req, res, next);
  });
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
  });

  //submit button in register page should take to login page
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const newUser = new user({
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: hashedPassword,
        role: req.body.role
      })
      const saveUser = await newUser.save();
      req.session.userId = saveUser._id;
      return res.redirect('/login');
    } catch {
        return res.redirect('/register');
    }
  });
  
  app.delete('/logout', (req, res) => {
    req.logOut();
    return res.redirect('/login');
  });
  
  // Adding Properties
  app.get('/addproperties', isAuthenticated, checkRole(owner), (req, res)=>{
    res.render('addproperties.ejs');
  });

  app.post('/addproperties', isAuthenticated, checkRole(owner), async (req, res) => {
    try {
      const newProperty = new property({
        owner: req.session.userId, 
        ownerName: req.body.ownerName,
        propertyType: new RegExp(req.body.propertyType, 'i'),
        subCategory: new RegExp(req.body.subCategory, 'i'),
        area: req.body.area,
        description: req.body.description,
        city: new RegExp(req.body.city, 'i'),
        state: new RegExp(req.body.state, 'i'),
        country: new RegExp(req.body.country, 'i'),
        address: req.body.address,
        price: req.body.price,
        amenities: req.body.amenities,
        images: req.body.images,
        rentedOut: false,
      });
      const savedProperty = await newProperty.save();
      req.session.propertyId = savedProperty._id;
      res.status(200).send('Property listed successfully');
    } catch (error) {
        res.status(403).send(error.message);
      }
  });

  // My properties page for owner to see his properties
  // In the frontend manan/vasudha should access details from the json responce
  app.get('/myproperties', isAuthenticated, checkRole(owner), (req, res) => {
      res.render('myproperties.ejs');
  });

  app.get('/api/myproperties', isAuthenticated, checkRole(owner), async (req, res) => {
    try {
      const properties = await property.find({ owner: req.session.userId });
      res.status(200).json(properties);
    } catch (error) {
      res.status(404).send(error.message);
    }
  });
  
  app.post('/myproperties/:id', isAuthenticated, checkRole('owner'), async (req, res) => {
    try {
      const propertyId = req.params.id;
      const updatedProperty = await property.findByIdAndUpdate(
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
  
  // when user submits the search form in home page it redirects to vacancies page
  // next if someone is trying to access get request to vacancies path
  // server renders vacancies.ejs file which in turn calls /api/vacancies. 
  app.post('/', isAuthenticated, (req, res) =>{
    try{
      const query = {};
      if (req.body.city) query.city = new RegExp(req.body.city, 'i');
      if (req.body.state) query.state = new RegExp(req.body.state, 'i');
      if (req.body.country) query.country = new RegExp(req.body.country, 'i');
      if (req.body.propertyType) query.propertyType = new RegExp(req.body.propertyType, 'i');
      if (req.body.subCategory) query.subCategory = new RegExp(req.body.subCategory, 'i');
      
      if (req.body.min_budget || req.body.max_budget) {
        query.price = {};
        if (req.body.min_budget) query.price.$gte = parseInt(req.body.min_budget);
        if (req.body.max_budget) query.price.$lte = parseInt(req.body.max_budget);
      }

      req.session.query = query;
      return res.redirect('/vacancies');
    } catch {
        return res.redirect('/');
    }
  });

  app.get('/vacancies', isAuthenticated, (req, res) => {
    const query = req.session.query || {};
    res.render('vacancies.ejs', {query});
  });

  app.get('/api/vacancies', isAuthenticated, async (req, res) => {
    try {
      const query = req.session.query || {};
      const properties = await property.find(query);

      res.status(200).json(properties);
    } catch (error) {
      res.status(404).send(error.message);
    }
  });

  app.post('/vacancies', isAuthenticated, (req, res) => {
    try{
      const query = {};
      if (req.body.city) query.city = new RegExp(req.body.city, 'i');
      if (req.body.state) query.state = new RegExp(req.body.state, 'i');
      if (req.body.country) query.country = new RegExp(req.body.country, 'i');
      if (req.body.propertyType) query.propertyType = new RegExp(req.body.propertyType, 'i');
      if (req.body.subCategory) query.subCategory = new RegExp(req.body.subCategory, 'i');

      if (req.body.min_budget || req.body.max_budget) {
        query.price = {};
        if (req.body.min_budget) query.price.$gte = parseInt(req.body.min_budget);
        if (req.body.max_budget) query.price.$lte = parseInt(req.body.max_budget);
      }
    
      req.session.query = query;
      return res.redirect('/vacancies');
    } catch (error) {
        res.status(404).send(error.message);
    }
  })

  app.post('/api/vacancies/:id', isAuthenticated, async (req, res) => {
    try {
      const propertyId = req.params.id;
      const userId = req.session.userId; 
      const property = await property.findById(propertyId);
      const tenant = await user.findById(userId);
  
      if (!property) {
        return res.status(404).send('Property not found');
      }
  
      const notification = new Notification({
        userId: property.owner,
        message: `<b>A tenant has applied for your property</b>: ${property.description}`,
        propertyId: property._id,
        applicantId: tenant._id,
        applicantName: tenant.name,
      });
  
      await notification.save();
  
      res.status(200).send('Application sent successfully');
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  });

  app.get('/dashboard', isAuthenticated, checkRole('owner'), async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.session.userId });
      res.render('dashboard', { notifications });
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  });
/* 
//Route to delete a property(this might be needed, 
// when property gets rented we should remove this)
  app.delete('/properties/:id', isAuthenticated, async (req, res) => {
    try {
      const property = await property.findById(req.params.id);
      if (!property) {
        return res.status(401).send('Property not found');
      }
      if (property.owner.toString() !== req.user._id.toString()) {
        return res.status(400).send('You do not have permission to delete this property');
      }
      await property.remove();
      res.status(200).send('Property deleted successfully');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
*/

  //Authentication
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/login');
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    next();
  }

  // Authorization
  function checkAuthorization(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send('Unauthorized: User not logged in');
    }
    next();
  }
  
  function checkRole(role) {
    return function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === role) {
            return next();
        }
        res.status(402).send(`Unauthorized: Only ${role}s can access this page`);
    };
  }

  // app.listen(100)
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
