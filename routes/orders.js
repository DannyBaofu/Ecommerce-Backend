const express = require('express')
const router = express.Router()
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const auth = require('../middleware/auth')

//Creating an order
router.post("/", auth,async (req,res) => {
    try {
        const userId = req.user.id

        const cart = await Cart.findOne({userId})

        if(cart) {
            //procees to checkout
            await Order.create({
                userId,
                items: cart.items,
                total: cart.total
            })
            //then empty the cart
            await Cart.findByIdAndDelete({_id:cart.id})
            return res.send("Checkout successfully")
        } else {
            return res.status(400).send("Your cart is empty")
        }
    }catch(err) {
        return res.status(400).json(err)
    }
})
module.exports = router