    // controllers/orderController.js

    import Order from '../models/Order.js';
    import Product from '../models/Product.js';



    // @desc    Create new order
    // @route   POST /api/orders
    // @access  Private (only accessible to authenticated users)
    export const createOrder = async (req, res) => {
      const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      } = req.body;

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, please log in.' });
      }

      if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
      }
      if (!shippingAddress || !shippingAddress.address || !shippingAddress.city ||
          !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.fullName) {
        return res.status(400).json({ message: 'Shipping address incomplete' });
      }

      try {
        for (const item of orderItems) {
          const product = await Product.findById(item.product);

          if (!product) {
            return res.status(404).json({ message: `Product not found: ${item.name}` });
          }

          if (product.stock < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}` });
          }

          product.stock -= item.quantity;
          await product.save();
        }

        const order = new Order({
          user: req.user._id,
          orderItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          isPaid: true,
          paidAt: Date.now(),
          isCancelled: false,
        });

        const createdOrder = await order.save();
            await Cart.findOneAndUpdate(
  { user: req.user._id },
  { items: [] }
);

        res.status(201).json(createdOrder);
      } catch (err) {
        console.error('❌ Order creation error:', err); // Keep console.error
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(val => val.message);
          return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to create order' });
      }
    };

    // @desc    Get order by ID
    // @route   GET /api/orders/:id
    // @access  Private
    export const getOrderById = async (req, res) => {
      try {
        const order = await Order.findById(req.params.id)
          .populate('user', 'name email')
          .populate('orderItems.product', 'name imageUrl price');

        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Not authorized to view this order.' });
        }

        res.status(200).json(order);
      } catch (err) {
        console.error('❌ Get order by ID error:', err); // Keep console.error
        if (err.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid order ID format' });
        }
        res.status(500).json({ message: 'Failed to fetch order' });
      }
    };

    // @desc    Get logged in user's orders
    // @route   GET /api/orders/myorders
    // @access  Private
    export const getMyOrders = async (req, res) => {
      try {
        const orders = await Order.find({ user: req.user._id })
          .populate('orderItems.product', 'name imageUrl price')
          .sort({ createdAt: -1 });

        res.status(200).json(orders);
      } catch (err) {
        console.error('❌ Get my orders error:', err); // Keep console.error
        res.status(500).json({ message: 'Failed to fetch your orders' });
      }
    };

    // @desc    Cancel an order
    // @route   PUT /api/orders/:id/cancel
    // @access  Private
    export const cancelOrder = async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);

        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Not authorized to cancel this order.' });
        }

        if (order.isDelivered) {
          return res.status(400).json({ message: 'Cannot cancel a delivered order.' });
        }
        if (order.isCancelled) {
          return res.status(400).json({ message: 'Order is already cancelled.' });
        }

        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          } else {
            console.warn(`Product with ID ${item.product} not found during stock restoration for order ${order._id}`); // Keep console.warn
          }
        }

        order.isCancelled = true;
        order.cancelledAt = Date.now();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

      } catch (err) {
        console.error('❌ Order cancellation error:', err); // Keep console.error
        if (err.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid order ID format' });
        }
        res.status(500).json({ message: 'Failed to cancel order' });
      }
    };


    // --- Admin Only Routes (Optional, can add later) ---
    export const getOrders = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized. Admin access required.' });
      }
      try {
        const orders = await Order.find({})
          .populate('user', 'id name email')
          .sort({ createdAt: -1 });
        res.status(200).json(orders);
      } catch (err) {
        console.error('❌ Get all orders error:', err); // Keep console.error
        res.status(500).json({ message: 'Failed to fetch all orders' });
      }
    };

    export const updateOrderToDelivered = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized. Admin access required.' });
      }
      try {
        const order = await Order.findById(req.params.id);

        if (order) {
          order.isDelivered = true;
          order.deliveredAt = Date.now();
          const updatedOrder = await order.save();
          res.json(updatedOrder);
        } else {
          res.status(404).json({ message: 'Order not found' });
        }
      } catch (err) {
        console.error('❌ Update order to delivered error:', err); // Keep console.error
        res.status(500).json({ message: 'Failed to update order to delivered' });
      }
    };
    