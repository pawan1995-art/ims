/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import sortAndPaginatePipeline from '../../lib/sortAndPaginate.pipeline';
import BaseServices from '../baseServices';
import Product from './product.model';
import matchStagePipeline from './product.aggregation.pipeline';
import CustomError from '../../errors/customError';
import Purchase from '../purchase/purchase.model';
import Seller from '../seller/seller.model';
import Category from '../category/category.model';
import Brand from '../brand/brand.model';
import { IProduct } from './product.interface';

class ProductServices extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

  /**
   * Create new product without transactions (standalone MongoDB)
   */
  async create(payload: IProduct, userId: string) {
    // Remove empty string fields
    (Object.keys(payload) as (keyof IProduct)[]).forEach((key) => {
      if (payload[key] === '') delete payload[key];
    });

    // Attach the user
    payload.user = new Types.ObjectId(userId);

    try {
      // Validate foreign references
      const seller = await Seller.findById(payload.seller);
      if (!seller) throw new CustomError(404, 'Seller not found');

      const category = await Category.findById(payload.category);
      if (!category) throw new CustomError(404, 'Category not found');

      if (payload.brand) {
        const brand = await Brand.findById(payload.brand);
        if (!brand) throw new CustomError(404, 'Brand not found');
      }

      // Create the product
      const product = await this.model.create(payload);

      // Record the initial purchase
      await Purchase.create({
        user: userId,
        seller: product.seller,
        product: product._id,
        sellerName: seller.name,
        productName: product.name,
        quantity: product.stock,
        unitPrice: product.price,
        totalPrice: product.stock * product.price,
      });

      return product;
    } catch (err: any) {
      console.error('🔥 createProduct error:', err);
      if (err instanceof CustomError) throw err;
      if (err.name === 'ValidationError') {
        throw new CustomError(400, err.message, err.errors);
      }
      throw new CustomError(500, err.message || 'Internal server error');
    }
  }

  /**
   * Count Total Product
   */
  async countTotalProduct(userId: string) {
    return this.model.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$stock' } } },
      { $project: { totalQuantity: 1, _id: 0 } }
    ]);
  }

  /**
   * Get All product of user
   */
  async readAll(query: Record<string, unknown> = {}, userId: string) {
    let data = await this.model.aggregate([
      ...matchStagePipeline(query, userId),
      ...sortAndPaginatePipeline(query)
    ]);

    const totalCount = await this.model.aggregate([
      ...matchStagePipeline(query, userId),
      { $group: { _id: null, total: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);

    data = await this.model.populate(data, { path: 'category', select: '-__v -user' });
    data = await this.model.populate(data, { path: 'brand', select: '-__v -user' });
    data = await this.model.populate(data, { path: 'seller', select: '-__v -user -createdAt -updatedAt' });

    return { data, totalCount };
  }

  /**
   * Get Single product of user
   */
  async read(id: string, userId: string) {
    await this._isExists(id);
    return this.model.findOne({ user: new Types.ObjectId(userId), _id: id });
  }

  /**
   * Multiple delete
   */
  async bulkDelete(payload: string[]) {
    const ids = payload.map((item) => new Types.ObjectId(item));
    return this.model.deleteMany({ _id: { $in: ids } });
  }

  /**
   * Add to stock without transactions
   */
  async addToStock(id: string, payload: Pick<IProduct, 'seller' | 'stock'>, userId: string) {
    try {
      // Validate seller
      const seller = await Seller.findById(payload.seller);
      if (!seller) throw new CustomError(404, 'Seller not found');

      // Update stock and return updated document
      const product: any = await this.model.findByIdAndUpdate(
        id,
        { $inc: { stock: payload.stock } },
        { new: true }
      );

      // Record purchase
      await Purchase.create({
        user: userId,
        seller: product.seller,
        product: product._id,
        sellerName: seller.name,
        productName: product.name,
        quantity: payload.stock,
        unitPrice: product.price,
        totalPrice: payload.stock * product.price,
      });

      return product;
    } catch (err: any) {
      console.error('🔥 addToStock error:', err);
      if (err instanceof CustomError) throw err;
      if (err.name === 'ValidationError') {
        throw new CustomError(400, err.message, err.errors);
      }
      throw new CustomError(500, err.message || 'Internal server error');
    }
  }
}

const productServices = new ProductServices(Product, 'Product');
export default productServices;
