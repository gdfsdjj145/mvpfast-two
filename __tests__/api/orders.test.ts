import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the order model - use inline mock to avoid hoisting issues
vi.mock('@/models/order', () => ({
  getOrders: vi.fn(),
  createOrder: vi.fn(),
}));

// Import after mocking
import { getOrders, createOrder } from '@/models/order';
import { GET, POST } from '@/app/api/orders/route';

describe('Orders API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return orders list successfully', async () => {
      const mockOrders = {
        items: [
          { id: '1', name: '订单1', price: 100 },
          { id: '2', name: '订单2', price: 200 },
        ],
        count: 2,
      };

      vi.mocked(getOrders).mockResolvedValue(mockOrders);

      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockOrders);
      expect(data.message).toBe('获取订单列表成功');
    });

    it('should handle pagination parameters', async () => {
      vi.mocked(getOrders).mockResolvedValue({ items: [], count: 0 });

      const request = new NextRequest('http://localhost:3000/api/orders?skip=10&take=20');
      await GET(request);

      expect(getOrders).toHaveBeenCalledWith({
        skip: 10,
        take: 20,
        where: {},
        orderBy: { created_time: 'desc' },
      });
    });

    it('should handle orderType filter', async () => {
      vi.mocked(getOrders).mockResolvedValue({ items: [], count: 0 });

      const request = new NextRequest('http://localhost:3000/api/orders?orderType=vip');
      await GET(request);

      expect(getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderType: 'vip' },
        })
      );
    });

    it('should handle default pagination values', async () => {
      vi.mocked(getOrders).mockResolvedValue({ items: [], count: 0 });

      const request = new NextRequest('http://localhost:3000/api/orders');
      await GET(request);

      expect(getOrders).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { created_time: 'desc' },
      });
    });

    it('should return 500 on error', async () => {
      vi.mocked(getOrders).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.data).toBeNull();
      expect(data.message).toBe('获取订单列表失败');
    });
  });

  describe('POST /api/orders', () => {
    const validOrderData = {
      identifier: 'user123',
      name: '测试订单',
      orderId: 'order123',
      orderType: 'vip',
      price: 100,
      promotionPrice: 80,
      transactionId: 'tx123',
    };

    it('should create order successfully', async () => {
      const mockCreatedOrder = {
        id: '1',
        ...validOrderData,
        created_time: new Date('2024-01-15T10:00:00.000Z'),
      };

      vi.mocked(createOrder).mockResolvedValue(mockCreatedOrder);

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      // JSON serialization converts Date to ISO string
      expect(data.data).toEqual({
        ...mockCreatedOrder,
        created_time: mockCreatedOrder.created_time.toISOString(),
      });
      expect(data.message).toBe('创建订单成功');
      expect(createOrder).toHaveBeenCalledWith(validOrderData);
    });

    it('should return 400 when required field is missing', async () => {
      const incompleteData = {
        identifier: 'user123',
        name: '测试订单',
        // Missing other required fields
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.data).toBeNull();
      expect(data.message).toContain('缺少必填字段');
    });

    it('should validate all required fields', async () => {
      const requiredFields = ['identifier', 'name', 'orderId', 'orderType', 'price', 'promotionPrice', 'transactionId'];

      for (const field of requiredFields) {
        const testData = { ...validOrderData };
        delete testData[field as keyof typeof testData];

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify(testData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain(field);
      }
    });

    it('should return 500 on database error', async () => {
      vi.mocked(createOrder).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.data).toBeNull();
      expect(data.message).toBe('创建订单失败');
    });
  });
});
