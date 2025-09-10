import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class PaginationService {
  async paginate(
    model: Model<any>,
    page: number = 1,
    limit: number = 10,
    query: any = {},
    sort: any = { createdAt: -1 },
  ) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      model.find(query).sort(sort).skip(skip).limit(limit).exec(),
      model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    return {
      data: items.length > 0 ? items : [],
      pagination: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }
}
