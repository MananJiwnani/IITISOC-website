# Property Rental and Management Web Application
## PS-7

## Mentor: Akanksha Prasad

## Team members: Tanmai, Arjun, Vasudha, Manan

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Possible Improvements](#possible-improvements)
- [Conclusion](#conclusion)


## Introduction

The Property Rental and Management Web Application is a comprehensive platform designed to simplify property rental processes for owners and tenants. The application allows property owners to list their properties, manage rental activities, and communicate with tenants, while tenants can search for properties, book rentals, and make payments.


## Features

- **Property Listing**: Owners can add and manage property details, amenities, images, and pricing.
- **Search and Filtering**: Tenants can find properties based on location, price range, and other criteria.
- **CHAT BOT**: An assistant chat bot which can assist and guide the newly joined users.
- **Booking and Payment**: Tenants can reserve and pay for rentals online.
- **Tenant Management**: Owners can view and manage tenant details.
- **Property Management Dashboard**: Provides analytics on rental income, occupancy rates, and maintenance requests.
- **Secure Authentication**: Secure Authentication is done based on the role of the user to maintain the security of the website.
- **Communication Channels**: Facilitates interactions between owners and tenants.

## Technologies Used

- **Frontend**: EJS, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js
- **Other**: Multer for file uploads, Mongoose for MongoDB interactions, RazorPay API for payments.


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MananJiwnani/IITISOC-website.git

2. Navigate to the project directory:
   ```bash
   cd property-rental-management

3. Install Dependencies:
   ```bash
   npm install

4. Set up environment variables in a .env file:
   ```bash 
   MONGO_URI=mongodb://localhost:27017/userDb
   PORT=3000
   SESSION_SECRET=4b3403665fea6b5d60eddf678e1ce5fba12da6b3a23c62e1e8b6d4e56af5a067
   RAZORPAY_ID_KEY="rzp_test_B4gf8bb7o4SxQp"
   RAZORPAY_SECRET_KEY="4FXYXKopTTS26DxV7xNJbvHM"

5. Start the application:
   ```bash
   npm start


## Usage

- **Property Listing**: Owners can add properties through the /addproperties page.
- **Owner Portal**: Portal for owners to view the status of their properties.
- **Owner Dashboard**: For owners to track their rental income and maintainance requests.
- **Rent Estimate Page**: A page for owners where they can get the approx. estimated rent for their property based on the Property Type, Location, Property Age and Price of their property.
- **Search and Filtering**: Tenants can search for properties on both homepage and vacancies page.
- **Booking and Payment**: Tenants can book properties and make payments through the 
                           /vacancies page.
- **Tenant Management**: Owners can view tenants through the /my_tenants page.
- **Tenant Portal**: Portal for tenants to view the properties bought rent by them, details of their owners.


## Possible Improvements

- **Enhanced Search and Filtering System**: Add more criteria such as property type, number of bedrooms, and additional amenities.
- **Automated Maintenance Requests**: Allow tenants to submit maintenance requests with automated notifications to property owners.
- **Improved Security Features**: Add two-factor authentication (2FA) and conduct regular security audits.
- **Multilingual Support**: Add support for multiple languages.
- **User Feedback System**: Integrate a system for user feedback and issue reporting.


## Conclusion

The Property Rental and Management Web Application is designed to streamline property rental and management processes for both property owners and tenants. With ongoing improvements and feature enhancements, the platform aims to provide a seamless and efficient user experience.
