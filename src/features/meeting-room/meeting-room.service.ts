import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment, MeetingRoom, User } from 'src/common/entities';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

@Injectable()
export class MeetingRoomService {
  constructor(
    @InjectRepository(MeetingRoom)
    private readonly meetingRoomRepo: Repository<MeetingRoom>,
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }


  async find(pageNo: number, pageSize: number, name: string, capacity: number, equipment: string, location: string, isBooked: number) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    if (capacity) {
      // condition.capacity = capacity;
      condition.capacity = MoreThanOrEqual(capacity)
    }
    if (location) {
      condition.location = Like(`%${location}%`)
    }
    if (isBooked) {
      condition.isBooked = isBooked
    }

    let [list, totalCount] = await this.meetingRoomRepo.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
      relations: ['manager']
    });

    return {
      list,
      totalCount
    }
  }

  async getEquipmentList(pageNo: number, pageSize: number) {
    if (pageNo < 1) {
      throw new BadRequestException('页码最小为 1');
    }
    const skipCount = (pageNo - 1) * pageSize;

    const [list, totalCount] = await this.equipmentRepo.findAndCount({
      skip: skipCount,
      take: pageSize
    })

    return {
      list,
      totalCount
    }
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.meetingRoomRepo.findOneBy({
      name: meetingRoomDto.name
    });

    if (room) {
      throw new BadRequestException('会议室名字已存在');
    }

    const user = new User();
    user.id = meetingRoomDto.managerId;

    const meetingRoom = new MeetingRoom();
    meetingRoom.name = meetingRoomDto.name;
    meetingRoom.capacity = meetingRoomDto.capacity;
    meetingRoom.description = meetingRoomDto.description;
    meetingRoom.location = meetingRoomDto.location;
    meetingRoom.equipment = meetingRoomDto.equipment;
    meetingRoom.manager = user;

    await this.meetingRoomRepo.save(meetingRoom);

    return '创建成功'
  }

  async update(id: number, meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.meetingRoomRepo.findOneBy({ id })

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    if (meetingRoomDto.capacity) meetingRoom.capacity = meetingRoomDto.capacity;
    if (meetingRoom.location) meetingRoom.location = meetingRoomDto.location;
    if (meetingRoom.name) meetingRoom.name = meetingRoomDto.name;
    if (meetingRoomDto.description) meetingRoom.description = meetingRoomDto.description;
    if (meetingRoomDto.equipment) meetingRoom.equipment = meetingRoomDto.equipment;
    if (meetingRoomDto.managerId) {
      const user = new User();
      user.id = meetingRoomDto.managerId;
      meetingRoom.manager = user;
    }

    await this.meetingRoomRepo.update({
      id: meetingRoom.id
    }, meetingRoom);
    return '修改成功';
  }

  async findById(id: number) {
    return this.meetingRoomRepo.findOne({
      where: { id },
      relations: ['manager']
    });
  }

  async delete(id: number) {
    await this.meetingRoomRepo.delete({
      id
    });
    return 'success';
  }
}
