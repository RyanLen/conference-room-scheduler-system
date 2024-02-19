import { Controller, Get, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';

@ApiTags('资源')
@Controller('file')
export class FileController {

  constructor(
    @Inject('OSS_CLIENT')
    private readonly ossClient,
    private configService: ConfigService
  ) { }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }

  @Get('access')
  async getAccessKey() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const res = this.ossClient.calculatePostSignature({
      expiration: date.toISOString(),
      conditions: [
        ["content-length-range", 0, 1048576000],
      ]
    });
    const { location } = await this.ossClient.getBucketLocation();
    const host = `http://${this.configService.get('oss_bucket')}.${location}.aliyuncs.com`;
    return {
      ...res,
      host
    }
  }
}
