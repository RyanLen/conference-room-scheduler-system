import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department, User } from 'src/common/entities';
import { Like, Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async list() {
    return await this.deptRepo.createQueryBuilder('dept')
      .leftJoinAndSelect('dept.leader', 'leader')
      .leftJoinAndSelect('dept.users', 'users')
      .select(['dept.id', 'dept.name', 'dept.description', 'dept.createTime', 'leader.id', 'leader.username', 'users.id', 'users.username'])
      .getMany();
  }

  async getDepartmentUser(id: number, username: string) {
    const condition: Record<string, any> = {};
    if (id) {
      condition.department = {
        id: +id
      }
    }
    if (username) {
      condition.username = Like(`%${username}%`);
    }
    return await this.userRepo.find({
      where: condition,
      take: 10
    })
  }

  async create(dto: CreateDepartmentDto) {
    const dept = new Department();
    dept.name = dto.name;
    if (dto.description) dept.description = dto.description;
    if (dto.leaderId) {
      const leader = await this.userRepo.findOneBy({ id: dto.leaderId });
      dept.leader = leader;
    }
    try {
      await this.deptRepo.save(dept);
      return '创建成功'
    } catch (error) {
      return '创建失败'
    }
  }

  async remove(id: number) {
    const affected = await this.deptRepo.delete({ id });
    if (affected.affected) {
      return '删除成功'
    } else {
      return '删除失败'
    }
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.deptRepo.findOneBy({ id });
    if (dto.name) dept.name = dto.name;
    if (dto.description) dept.description = dto.description;
    if (dto.leader) {
      const leader = await this.userRepo.findOneBy({ username: dto.leader });
      dept.leader = leader;
    }
    try {
      await this.deptRepo.save(dept);
      return '修改成功'
    } catch (error) {
      return '修改失败'
    }
  }
}
