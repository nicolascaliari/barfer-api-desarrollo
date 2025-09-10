import { Injectable } from '@nestjs/common';
import { AnnouncementDto } from './dto/announcement.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../../schemas/event.schema';
import { Model } from 'mongoose';
import { announcement } from '../../common/resources/seeds.resources';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}
  async findAll() {
    return await this.eventModel.find({}).exec();
  }

  async update(id: string, announcement: AnnouncementDto) {
    return await this.eventModel.findByIdAndUpdate(id, announcement, {
      new: true,
    });
  }

  async seedAnnouncements() {
    const event = await this.eventModel.find({}).exec();
    if (event.length > 0) {
      return;
    }
    await this.eventModel.insertMany(announcement);
  }
}
