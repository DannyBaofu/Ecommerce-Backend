const express = require('express')
const router = express.Router()
const Cart = require('../models/Cart')
const auth = require('../middleware/auth')
const Item = require('../models/Item')
// VIEW CART
router.get("/", auth, async (req, res) => {
  // access the user details from req.user
  // RETURN THE CART OF THE USER WHO IS LOGGED IN
  // IF NO ITEMS ON THE  CART RETURN A MESSAGE THAT SAYS "YOUR CART IS EMPTY"
  try {
    const userId = req.user.id
    const cart = await Cart.findOne({ userId })
    if (cart && cart.items.length > 0) {
      return res.json(cart)
    } else {
      return res.send("Your cart is empty")
    }
  } catch (e) {
    return res.status(400).json(err)
  }
})

// ADD TO CART
router.post("/", auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body
    console.log(itemId)
    console.log(quantity)
    const userId = req.user.id
    const item = await Item.findOne({ _id: itemId })
    const cart = await Cart.findOne({ userId })
    if (cart == null) {
      const newCart = await Cart.create({
        userId,
        items: [{
          itemId,
          name: item.name,
          quantity,
          price: item.price,
          subtotal: item.price * quantity,
          image: item.image
        }],
        total: item.price * quantity
      })
      return res.json({ msg: "Item added to cart successfully", newCart })
    }
    if (cart) {
      const foundItem = cart.items.find(item => item.itemId === itemId)
      if (foundItem) {
        foundItem.quantity += quantity
        foundItem.subtotal += (quantity * foundItem.price)
        cart.total = (foundItem.quantity * foundItem.price)
        cart.items.map(item => item.itemId === itemId ? foundItem : item)
      } else {
        cart.items.push({
          itemId,
          name: item.name,
          quantity, price: item.price,
          subtotal: item.price * quantity,
          image: item.image
        })
        cart.total += item.price * quantity
      }
      await cart.save()
      return res.json({ msg: "Item added to cart successfully", cart: cart.items, total: cart.total })
    }
  } catch (e) {
    return res.status(400).json(e)
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    let itemsSubtotal;
    if (cart) {
      let newItems = cart.items.filter((item) => {
        if (item.itemId !== itemId) {
          return item;
        }
        itemsSubtotal = item.subtotal;
      });
      cart.items = newItems;
      cart.total -= itemsSubtotal;
      cart.save();
      return res.json({ msg: "Item removed from cart", cart: cart.items });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
})

router.delete("/empty/:id", auth, (req, res) => {
  if (req.user.isAdmin) return res.status(401).json({ msg: "You are unauthorized" })

  Cart.findOneAndDelete({ _id: req.params.id }, (err, cart) => {
    if (err) return res.status(400).json({ err })
    return res.json({ msg: "Cart has been empty" })
  })
})

module.exports = router