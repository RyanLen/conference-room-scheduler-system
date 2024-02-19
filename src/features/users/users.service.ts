import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { CAPTCHA_MAIL_BIND, CAPTCHA_MAIL_REGISTER, CAPTCHA_PHONE_BIND, CAPTCHA_PHONE_REGISTER, EVENT_ACTIVE } from 'src/common/constants';
import { ERR_CAPTCHA_EXPIRES, ERR_CAPTCHA_INVALID, ERR_DELETE, ERR_EXISTED, ERR_PHONE_BIND, ERR_USERNAME_EXISTED, ERR_USER_INFO_UPDATE, ERR_USER_PASSWORD_UPDATE, ERR_USER_REGISTER } from 'src/common/constants/exceptions.cons';
import { Department, Permission, Role, User } from 'src/common/entities';
import { JwtUserPayload } from 'src/common/interfaces';
import { CustomException } from 'src/core/exceptions';
import { EntityManager, FindOneOptions, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { BindEmailDto } from '../auth/dto/bind-email.dto';
import { RedisService } from '../redis/redis.service';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { CreateUserByMailDto } from './dto/create-user-by-mail.dto';
import { CreateUserByPhoneDto } from './dto/create-user-by-phone.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Injectable()
export class UsersService {
  private logger = new Logger();

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async remove(id: number) {
    const { affected } = await this.userRepo.delete({ id })
    if (affected !== 1) {
      throw new CustomException('删除失败', ERR_DELETE)
    }
    return true
  }

  async createByMail(dto: CreateUserByMailDto) {
    const code = await this.redisService.generateCode(CAPTCHA_MAIL_REGISTER(dto.email), 16, 60 * 60 * 12)
    const existed = await this.userRepo.findOne({
      where: [
        { username: dto.username },
        { email: dto.email }
      ]
    })
    if (existed) {
      throw new CustomException('用户名或邮箱已存在', ERR_USERNAME_EXISTED)
    }

    const user = new User();
    user.username = dto.username;
    user.password = await hash(dto.password, 10);
    user.email = dto.email;
    user.isFrozen = true

    try {
      await this.userRepo.save(user);
      this.eventEmitter.emit(EVENT_ACTIVE, {
        to: dto.email,
        data: {
          name: dto.username,
          link: `http://127.0.0.1:3000/auth/active?mail=${dto.email}&token=${code}`
        }
      })
      return '注册成功,请留意邮箱激活账号';
    } catch (e) {
      this.logger.error(e, UsersService);
      throw new CustomException('注册失败', ERR_USER_REGISTER)
    }
  }

  async activeAccount(email: string, token: string) {
    const code = await this.redisService.get(CAPTCHA_MAIL_REGISTER(email))
    if (!code) {
      throw new CustomException("已失效", ERR_CAPTCHA_EXPIRES)
    }
    if (code !== token) {
      throw new CustomException("无效的激活链接", ERR_CAPTCHA_INVALID)
    }

    const res = await this.userRepo.update({
      email
    }, {
      isFrozen: false
    })

    return res.affected > 0
  }

  async createByPhone(dto: CreateUserByPhoneDto) {
    await this.redisService.verifyCaptcha(CAPTCHA_PHONE_REGISTER(dto.phone), dto.captcha)

    const existed = await this.userRepo.findOne({
      where: [
        { username: dto.username },
        { phoneNumber: dto.phone }
      ]
    })
    if (existed) {
      throw new CustomException('用户名或手机已存在', ERR_USERNAME_EXISTED)
    }

    const user = new User();
    user.username = dto.username;
    user.password = await hash(dto.password, 10);
    user.phoneNumber = dto.phone;

    try {
      await this.userRepo.save(user)
      return '注册成功'
    } catch (e) {
      this.logger.error(e, UsersService);
      throw new CustomException('注册失败', ERR_USER_REGISTER)
    }
  }

  async findOne(filtered: FindOneOptions) {
    return await this.userRepo.findOne(filtered);
  }

  async find(filtered: FindOptionsWhere<User>) {
    const user = await this.userRepo.findOne({
      where: filtered,
      relations: ['roles', 'department']
    })

    return user
  }

  async getUserInfo(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions', 'department']
    })
    return user
  }

  async updatePhone(id: number, dto: BindPhoneDto) {
    await this.redisService.verifyCaptcha(CAPTCHA_PHONE_BIND(dto.phone), dto.captcha)

    const user = await this.userRepo.findOneBy({ id })
    user.phoneNumber = dto.phone
    try {
      await this.userRepo.save(user)
      return '绑定成功'
    } catch (e) {
      throw new CustomException('绑定失败', ERR_PHONE_BIND)
    }
  }

  async updatePassword(id: number, dto: UpdateUserPasswordDto) {
    const user = await this.userRepo.findOneBy({ id })
    const isVaild = await compare(dto.oldPassword, user.password)
    if (!isVaild) {
      throw new CustomException('原密码错误', ERR_USER_PASSWORD_UPDATE);
    }
    user.password = await hash(dto.password, 10)
    try {
      await this.userRepo.save(user)
      return '修改成功'
    } catch (error) {
      return '修改失败'
    }
  }

  private async checkExisted(username: string, email: string, phone: string, id: number = -1) {
    const findOptions: FindOptionsWhere<User>[] = []
    if (username) {
      findOptions.push({ username })
    }
    if (email) {
      findOptions.push({ email })
    }
    if (phone) {
      findOptions.push({ phoneNumber: phone })
    }
    if (findOptions.length > 0) {
      const existed = await this.userRepo.findOneBy(findOptions)
      if (existed) {
        if (existed.id == id || id === -1) {
          return
        }
        throw new CustomException('用户名或邮箱或手机已存在', ERR_EXISTED)
      }
    }
  }

  private async assignDtoToUser(user: User, dto: UpdateUserInfoDto | CreateUserDto) {
    if (dto.username) user.username = dto.username
    if (dto.avatar) user.avatar = dto.avatar
    if (dto.email) user.email = dto.email
    if (dto.phone) user.phoneNumber = dto.phone
    if (dto.password) user.password = await hash(dto.password, 10)
    if (dto.isFrozen !== undefined) user.isFrozen = dto.isFrozen
    if (dto.department) {
      const d = new Department()
      d.id = dto.department
      user.department = d
    }
    const roles = (dto.roles && dto.roles.length > 0) ? await this.roleRepo.findBy({ id: In(dto.roles) }) : null;
    if (roles) user.roles = roles
    return user
  }

  async updateUserInfo(id: number, dto: UpdateUserInfoDto) {
    await this.checkExisted(dto.username, dto.email, dto.phone, id)

    const user = await this.userRepo.findOneBy({ id })

    await this.assignDtoToUser(user, dto)

    try {
      await this.userRepo.save(user)
      return '修改成功'
    } catch (error) {
      return '修改失败'
    }
  }

  async createUser(dto: CreateUserDto) {
    await this.checkExisted(dto.username, dto.email, dto.phone)

    const user = new User();
    await this.assignDtoToUser(user, dto)

    try {
      await this.userRepo.save(user)
      return '添加成功'
    } catch (error) {
      return '添加失败'
    }
  }

  async updateInfo(id: number, dto: UpdateInfoDto) {
    const existed = await this.userRepo.findOneBy({ username: dto.username })
    if (existed && existed.id !== id) {
      throw new CustomException('用户名已存在', ERR_USERNAME_EXISTED)
    }
    const res = await this.userRepo.update({
      id
    }, {
      username: dto.username,
      avatar: dto.avatar,
    })

    if (res.affected !== 1) {
      throw new CustomException('更新失败', ERR_USER_INFO_UPDATE)
    }
    return '修改成功'
  }

  async freezeUserById(id: number) {
    const user = await this.userRepo.findOneBy({
      id
    });

    user.isFrozen = true;

    await this.userRepo.save(user);
  }

  async findUsers(username: string, email: string, roles: string[], departments: string[], isFrozen: boolean, pageNo: number, pageSize: number) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (roles && roles.length > 0) {
      const res = await this.userRepo.find({
        where: {
          roles: {
            id: In(roles)
          }
        },
        select: ['id']
      })
      const ids = res.map(it => it.id)
      condition.id = In(ids)
    }

    if (username) {
      condition.username = Like(`%${username}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }
    if (isFrozen !== undefined) {
      if (typeof isFrozen === 'string' && (isFrozen as string).length > 0) {
        condition.isFrozen = isFrozen === 'true';
      }
    }

    if (departments && departments.length > 0) {
      condition.department = In(departments)
    }

    const [users, totalCount] = await this.userRepo.findAndCount({
      where: condition,
      relations: ['department', 'roles'],
      skip: skipCount,
      take: pageSize,
    });

    return {
      list: users,
      totalCount
    };
  }

  async bindEmail(user: JwtUserPayload, dto: BindEmailDto) {
    await this.redisService.verifyCaptcha(CAPTCHA_MAIL_BIND(dto.email), dto.captcha)
    try {
      await this.userRepo.update({
        id: user.id
      }, {
        email: dto.email
      })
      return '绑定成功'
    } catch (error) {
      return '绑定失败'
    }
  }

  async bindPhone(user: JwtUserPayload, dto: BindPhoneDto) {
    await this.redisService.verifyCaptcha(CAPTCHA_PHONE_BIND(dto.phone), dto.captcha)
    try {
      await this.userRepo.update({
        id: user.id
      }, {
        phoneNumber: dto.phone
      })
      return '绑定成功'
    } catch (error) {
      return '绑定失败'
    }
  }
}

