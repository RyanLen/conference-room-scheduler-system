import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment, MeetingRoom, User } from 'src/common/entities';
import { MeetingRoomController } from './meeting-room.controller';
import { MeetingRoomService } from './meeting-room.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingRoom, Equipment, User])
  ],
  controllers: [MeetingRoomController],
  providers: [MeetingRoomService],
  exports: [MeetingRoomService]
})
export class MeetingRoomModule { }
