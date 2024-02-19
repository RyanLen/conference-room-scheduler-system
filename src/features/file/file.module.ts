import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as MAO from 'multer-aliyun-oss';
import { FileController } from './file.controller';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<MulterOptions> => ({
        storage: new MAO({
          config: {
            region: configService.get('oss_region'),
            accessKeyId: configService.get('oss_access_key_id'),
            accessKeySecret: configService.get('oss_access_key_secret'),
            bucket: configService.get('oss_bucket'),
          },
        }),
        limits: {
          fileSize: 1024 * 1024 * 5,
        },
      }),
    }),
  ],
  providers: [
    {
      provide: 'OSS_CLIENT',
      async useFactory(configService: ConfigService) {
        const OSS = require('ali-oss');
        const client = new OSS({
          region: configService.get('oss_region'),
          accessKeyId: configService.get('oss_access_key_id'),
          accessKeySecret: configService.get('oss_access_key_secret'),
          bucket: configService.get('oss_bucket'),
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FileController]
})
export class FileModule { }
