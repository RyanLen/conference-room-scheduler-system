import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { Booking, Department, Equipment, MeetingRoom, Menu, Meta, Permission, Role, Template, User } from './common/entities';
import {
  FormatResponseInterceptor,
  InvokeRecordInterceptor,
} from './core/interceptors';

import { AppController } from './app.controller';

import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUE_PREFIX } from './common/constants';
import { ThirdPartyAuth } from './common/entities/third-party-auth.entity';
import { CustomErrorFilter, CustomExceptionFilter } from './core/filters';
import { RequestCountMiddleware } from './core/middleware';
import { AuthModule } from './features/auth/auth.module';
import { BookingModule } from './features/booking/booking.module';
import { DepartmentModule } from './features/department/department.module';
import { TypedEventEmmiterModule } from './features/event-emitter/typed-event-emmiter.module';
import { FileModule } from './features/file/file.module';
import { MailModule } from './features/mail/mail.module';
import { MeetingRoomModule } from './features/meeting-room/meeting-room.module';
import { MenuModule } from './features/menu/menu.module';
import { PermissionModule } from './features/permission/permission.module';
import { RedisModule } from './features/redis/redis.module';
import { RoleModule } from './features/role/role.module';
import { SmsModule } from './features/sms/sms.module';
import { StatisticModule } from './features/statistic/statistic.module';
import { TasksModule } from './features/tasks/tasks.module';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_port'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true,
          logging: true,
          entities: [User, Role, Permission, MeetingRoom, Booking, ThirdPartyAuth, Department, Equipment, Menu, Meta, Template],
          poolSize: 10,
          connectorPackage: 'mysql2',
          timezone: '+08:00',
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          connection: {
            host: configService.get('redis_server_host'),
            port: configService.get('redis_server_port'),
            db: configService.get('redis_server_queue_db')
          },
          prefix: QUEUE_PREFIX,
          defaultJobOptions: {
            removeOnComplete: 1000,
            removeOnFail: 5000,
          },
        }
      },
      inject: [ConfigService]
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([User, Permission, Role]),
    ScheduleModule.forRoot(),
    MailModule,
    RedisModule,
    SmsModule,
    AuthModule,
    UsersModule,
    FileModule,
    MeetingRoomModule,
    BookingModule,
    StatisticModule,
    TasksModule,
    PermissionModule,
    TypedEventEmmiterModule,
    DepartmentModule,
    MenuModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InvokeRecordInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: CustomErrorFilter
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestCountMiddleware)
      .forRoutes('*');
  }
}
