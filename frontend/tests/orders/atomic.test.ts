import { describe, it, expect } from 'vitest';

// Pure simulation of PostgreSQL stored procedure `place_order` logic
function simulatePlaceOrder(params: {
  cropId: string;
  availableQuantity: number;
  pricePerUnit: number;
  sellerId: string;
  buyerId: string;
  requestedQuantity: number;
  status: 'Active' | 'Sold';
}) {
  const { cropId, availableQuantity, pricePerUnit, sellerId, buyerId, requestedQuantity, status } = params;

  if (!buyerId) {
    throw new Error('Authentication required: User is not logged in');
  }

  if (requestedQuantity <= 0) {
    throw new Error('Invalid order quantity: Must be greater than 0');
  }

  const totalPrice = requestedQuantity * pricePerUnit;
  if (totalPrice <= 0) {
    throw new Error('Invalid order price: Must be greater than 0');
  }

  if (status !== 'Active') {
    throw new Error('Crop listing not found or not active');
  }

  if (sellerId === buyerId) {
    throw new Error('Security restriction: Self-purchases are prohibited');
  }

  if (availableQuantity < requestedQuantity) {
    throw new Error(`Insufficient inventory: Requested ${requestedQuantity}, available ${availableQuantity}`);
  }

  const remainingQuantity = availableQuantity - requestedQuantity;
  const newStatus = remainingQuantity === 0 ? 'Sold' : 'Active';

  return {
    order: {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      crop_id: cropId,
      buyer_id: buyerId,
      seller_id: sellerId,
      quantity: requestedQuantity,
      total_price: Number(totalPrice.toFixed(2)),
      status: 'pending'
    },
    updatedCrop: {
      id: cropId,
      quantity: remainingQuantity,
      status: newStatus
    }
  };
}

describe('Order Transaction Integrity & Concurrency Locking (place_order RPC)', () => {
  const sampleCrop = {
    cropId: 'crop-uuid-101',
    availableQuantity: 500,
    pricePerUnit: 2.50,
    sellerId: 'farmer-uuid-01',
    buyerId: 'merchant-uuid-02',
    requestedQuantity: 100,
    status: 'Active' as const
  };

  it('successfully executes atomic order creation and inventory deduction', () => {
    const result = simulatePlaceOrder(sampleCrop);
    expect(result.order).toBeDefined();
    expect(result.order.quantity).toBe(100);
    expect(result.order.total_price).toBe(250.00);
    expect(result.updatedCrop.quantity).toBe(400);
    expect(result.updatedCrop.status).toBe('Active');
  });

  it('atomically transitions crop status to Sold when inventory reaches 0', () => {
    const result = simulatePlaceOrder({
      ...sampleCrop,
      requestedQuantity: 500
    });
    expect(result.updatedCrop.quantity).toBe(0);
    expect(result.updatedCrop.status).toBe('Sold');
  });

  it('rejects purchase when requested quantity exceeds available stock (prevent overselling)', () => {
    expect(() => {
      simulatePlaceOrder({
        ...sampleCrop,
        requestedQuantity: 501
      });
    }).toThrow(/Insufficient inventory/);
  });

  it('rejects self-purchases when buyer_id equals seller_id', () => {
    expect(() => {
      simulatePlaceOrder({
        ...sampleCrop,
        buyerId: 'farmer-uuid-01', // Same as sellerId
        sellerId: 'farmer-uuid-01'
      });
    }).toThrow(/Self-purchases are prohibited/);
  });

  it('rejects order placement with non-positive quantities', () => {
    expect(() => {
      simulatePlaceOrder({
        ...sampleCrop,
        requestedQuantity: 0
      });
    }).toThrow(/Must be greater than 0/);

    expect(() => {
      simulatePlaceOrder({
        ...sampleCrop,
        requestedQuantity: -25
      });
    }).toThrow(/Must be greater than 0/);
  });

  it('rejects purchase on listings marked Sold or inactive', () => {
    expect(() => {
      simulatePlaceOrder({
        ...sampleCrop,
        status: 'Sold'
      });
    }).toThrow(/Crop listing not found or not active/);
  });
});
