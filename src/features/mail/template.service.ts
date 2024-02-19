import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { Template } from 'src/common/entities';
import { Repository } from 'typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,
  ) { }

  async createTemplate(dto: CreateTemplateDto) {
    const template = new Template()
    template.name = dto.name
    template.path = dto.path
    return await this.templateRepo.save(template)
  }

  async getTemplateList() {
    return await this.templateRepo.find()
  }

  async getTemplate(name: string) {
    const template = await this.templateRepo.findOneBy({ name })
    const filePath = join(__dirname, 'templates', `${template.path}.hbs`);
    return await fs.promises.readFile(filePath, 'utf8')
  }

  async updateTemplate(name: string, content: string) {
    try {
      console.log("updateTemplate -> content", content);
      const template = await this.templateRepo.findOneBy({ name })
      const filePath = join(__dirname, 'templates', `${template.path}.hbs`);
      console.log("updateTemplate -> filePath", filePath);
      await fs.promises.writeFile(filePath, content);
      return '更新成功'
    } catch (error) {
      return '更新失败'
    }
  }
}
