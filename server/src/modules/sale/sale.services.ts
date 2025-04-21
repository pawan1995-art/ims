/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import sortAndPaginatePipeline from '../../lib/sortAndPaginate.pipeline';
import BaseServices from '../baseServices';
import Sale from './sale.model';
import Product from '../product/product.model';
import CustomError from '../../errors/customError';

class SaleServices extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

  /**
   * Create new sale and decrease product stock
   */
  async create(payload: any, userId: string) {
    // Destructure and compute total price
    const { product: productId, productPrice, quantity } = payload;
    payload.user = userId;
    payload.totalPrice = productPrice * quantity;

    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError(404, 'Product not found');
    }

    // Check stock availability
    if (quantity > product.stock) {
      throw new CustomError(400, `${quantity} product(s) not available in stock!`);
    }

    try {
      // 1) Update product stock
      product.stock -= quantity;
      await product.save();

      // 2) Create sale record
      const sale = await this.model.create({ ...payload });
      return sale;

    } catch (err: any) {
      console.error('🔥 createSale error:', err);
      // Re-throw known CustomErrors
      if (err instanceof CustomError) throw err;
      // Handle Mongoose validation errors
      if (err.name === 'ValidationError') {
        throw new CustomError(400, err.message, err.errors);
      }
      // Fallback
      throw new CustomError(500, err.message || 'Internal server error');
    }
  }

  /**
   * Get all sales for a user with optional filters
   */
  async readAll(query: Record<string, unknown> = {}, userId: string) {
    const search = query.search ? (query.search as string) : '';
    const data = await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          $or: [
            { productName: { $regex: search, $options: 'i' } },
            { buyerName: { $regex: search, $options: 'i' } }
          ]
        }
      },
      ...sortAndPaginatePipeline(query)
    ]);
    const totalCount = await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          $or: [
            { productName: { $regex: search, $options: 'i' } },
            { buyerName: { $regex: search, $options: 'i' } }
          ]
        }
      },
      { $count: 'total' }
    ]);
    return { data, totalCount: totalCount[0]?.total || 0 };
  }

  /**
   * Get single sale by ID
   */
  async read(id: string, userId: string) {
    await this._isExists(id);
    return this.model.findOne({ user: new Types.ObjectId(userId), _id: id }).populate({
      path: 'product',
      select: '-createdAt -updatedAt -__v'
    });
  }
}

const saleServices = new SaleServices(Sale, 'Sale');
export default saleServices;
