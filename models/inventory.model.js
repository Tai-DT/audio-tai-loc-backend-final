const mongoose = require('mongoose');

// Stock Movement Schema - for tracking history
const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant'
  },
  movementType: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment', 'reservation', 'cancellation'],
    required: true
  },
  quantity: {
    type: Number,
    required: true // positive for in, negative for out
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  reason: String,
  referenceType: {
    type: String,
    enum: ['order', 'purchase_order', 'manual_adjustment', 'return']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceType'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Stock Reservation Schema - for checkout process
const stockReservationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  cartId: String,
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'confirmed', 'cancelled', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 15*60*1000) // 15 minutes
  }
}, {
  timestamps: true
});

// Stock Alert Configuration
const stockAlertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant'
  },
  threshold: {
    type: Number,
    required: true,
    default: 10
  },
  alertType: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'overstock'],
    default: 'low_stock'
  },
  notificationChannels: [{
    type: String,
    enum: ['email', 'sms', 'dashboard']
  }],
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastAlertSent: Date
}, {
  timestamps: true
});

// Inventory Summary Schema - for current stock levels
const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  variants: [{
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant'
    },
    sku: String,
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    autoDisableWhenOutOfStock: {
      type: Boolean,
      default: true
    },
    isOutOfStock: {
      type: Boolean,
      default: false
    },
    lastRestocked: Date,
    lastSold: Date
  }],
  totalStock: {
    type: Number,
    default: 0
  },
  totalReserved: {
    type: Number,
    default: 0
  },
  totalAvailable: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ variantId: 1, createdAt: -1 });
stockReservationSchema.index({ expiresAt: 1 });
stockReservationSchema.index({ productId: 1, status: 1 });
inventorySchema.index({ productId: 1 });

// Virtual for available stock calculation
inventorySchema.virtual('variants.calculatedAvailable').get(function() {
  return this.currentStock - this.reservedStock;
});

// Methods
inventorySchema.methods.updateAvailableStock = function(variantId = null) {
  if (variantId) {
    const variant = this.variants.find(v => v.variantId.toString() === variantId.toString());
    if (variant) {
      variant.availableStock = variant.currentStock - variant.reservedStock;
      variant.isOutOfStock = variant.availableStock <= 0;
    }
  } else {
    this.variants.forEach(variant => {
      variant.availableStock = variant.currentStock - variant.reservedStock;
      variant.isOutOfStock = variant.availableStock <= 0;
    });
    this.totalAvailable = this.totalStock - this.totalReserved;
  }
};

module.exports = {
  StockMovement: mongoose.model('StockMovement', stockMovementSchema),
  StockReservation: mongoose.model('StockReservation', stockReservationSchema),
  StockAlert: mongoose.model('StockAlert', stockAlertSchema),
  Inventory: mongoose.model('Inventory', inventorySchema)
};
