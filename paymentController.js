const session = require('express-session');
const Razorpay = require('razorpay'); 
const Property = require('./property');

// const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// const razorpayInstance = new Razorpay({
//     key_id: RAZORPAY_ID_KEY,
//     key_secret: RAZORPAY_SECRET_KEY
// });

const renderProductPage = async(req,res)=>{
    try {
        const query = req.session.query || {};
        let vacancies = await Property.find(query).populate(['subCategory', 'propertyType', 'address', 'city', 'state', 'price']);
        res.render('vacancies.ejs', {
            userId: req.session.user_id,
            properties: vacancies
        });
    } catch (error) {
        console.log(error.message);
    }
}

const createOrder = async(req,res)=>{
    try {
        const amount = req.body.price*100
        const options = {
            price: price,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }

        razorpayInstance.orders.create(options, 
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success:true,
                        msg:'Order Created',
//                         order_id:order.id,
                        price:price,
//                         key_id:RAZORPAY_ID_KEY,
//                         product_name:req.body.name,
//                         description:req.body.description,
                        contact:"9515350605",
                        name: "Tanmai Sai",
                        email: "tanmaisaich@gmail.com"
                    });
                }
                else{
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    renderProductPage,
    createOrder
}
