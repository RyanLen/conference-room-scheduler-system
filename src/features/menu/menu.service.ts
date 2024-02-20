import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Menu, Role } from 'src/common/entities';
import { Meta } from 'src/common/entities/meta.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateOrderBatchDto } from './dto/update-order.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private dataSource: DataSource
  ) { }

  async findAllWithRoles(userRoles: string[]) {
    const roles = await this.roleRepo.find({
      where: {
        name: In(userRoles)
      }
    })
    const rolesIds = roles.map(role => role.id)
    const menus = await this.entityManager
      .createQueryBuilder(Menu, "menu")
      .leftJoinAndSelect("menu.roles", "role")
      .leftJoinAndSelect("menu.meta", "meta")
      .leftJoinAndSelect("menu.children", "children")
      .leftJoinAndSelect("children.meta", "childrenMeta")
      .where("role.id IN (:...ids)", { ids: rolesIds })
      .andWhere("menu.parent IS NULL")
      .getMany();

    return {
      list: menus
    };
  }

  async getMenu(parentId: number, userRoles: string[]) {
    // 如果 parentId 为 0，则查询一级菜单，如果不为 0，则查询子菜单，同时查询菜单的时候需要查询是否有子菜单，并用chirdren字段存储（布尔值）
    const menus = await this.entityManager
      .createQueryBuilder(Menu, "menu")
      .leftJoinAndSelect("menu.roles", "role")
      .leftJoinAndSelect("menu.meta", "meta")
      .loadRelationCountAndMap("menu.children", "menu.children")
      // .where("role.name IN (:...name)", { name: userRoles })
      .andWhere(parentId > 0 ? "menu.parent.id = :id" : "menu.parent IS NULL", { id: parentId })
      .orderBy("meta.orderNo")
      .getMany();
    return {
      list: menus
    }
  }

  async getMenuDetail(id: number) {
    const menu = await this.entityManager
      .createQueryBuilder(Menu, "menu")
      .leftJoinAndSelect("menu.roles", "role")
      .leftJoinAndSelect("menu.meta", "meta")
      .where("menu.id = :id", { id })
      .getOne();
    return menu;
  }
  async createMenu(dto: CreateMenuDto) {
    try {
      this.dataSource.transaction(async manager => {
        const meta = new Meta()
        meta.title = dto.meta.title
        meta.icon = dto.meta.icon
        meta.expanded = dto.meta.expanded
        meta.hidden = dto.meta.hidden
        meta.hiddenBreadcrumb = dto.meta.hiddenBreadcrumb
        meta.single = dto.meta.single
        meta.frameSrc = dto.meta.frameSrc
        meta.frameBlank = dto.meta.frameBlank
        meta.keepAlive = dto.meta.keepAlive
        await manager.save(meta)

        const menu = new Menu()
        menu.meta = meta
        menu.path = dto.path
        menu.name = dto.name
        menu.component = dto.component
        menu.redirect = dto.redirect
        const parent = new Menu()
        if (dto.parentId) parent.id = +dto.parentId
        menu.parent = parent
        menu.roles = []
        dto.roles.forEach(async roleId => {
          const role = new Role()
          role.id = roleId
          menu.roles.push(role)
        })
        await manager.save(menu)
        // await manager.save(menu)
        return '创建成功'
      })
    } catch (error) {
      return '创建失败'
    }
  }

  async updateMenu(id: number, dto: UpdateMenuDto) {
    try {
      await this.dataSource.transaction(async manager => {
        const menu = await manager.findOne(Menu, {
          where: { id },
          relations: ['meta']
        })
        const meta = await manager.findOne(Meta, {
          where: { id: menu.meta.id }
        })
        meta.title = dto.meta.title
        meta.icon = dto.meta.icon
        meta.expanded = dto.meta.expanded
        meta.hidden = dto.meta.hidden
        meta.hiddenBreadcrumb = dto.meta.hiddenBreadcrumb
        meta.single = dto.meta.single
        meta.frameSrc = dto.meta.frameSrc
        meta.frameBlank = dto.meta.frameBlank
        meta.keepAlive = dto.meta.keepAlive
        await manager.save(meta)

        menu.path = dto.path
        menu.name = dto.name
        menu.component = dto.component
        menu.redirect = dto.redirect

        menu.roles = []
        dto.roles.forEach(async roleId => {
          const role = new Role()
          role.id = roleId
          menu.roles.push(role)
        })
        await manager.save(menu)
      })
      return '修改成功'
    } catch (error) {
      return '修改失败'
    }
  }

  async deleteMenu(id: number) {
    try {
      await this.entityManager.delete(Menu, id)
      return '删除成功'
    } catch (error) {
      return '删除失败'
    }
  }

  async toggleHiddenMenu(id: number) {
    const menu = await this.menuRepo.findOne({
      where: { id },
      relations: ['meta']
    })
    const meta = await this.entityManager.findOneBy(Meta, { id: menu.meta.id })
    meta.hidden = !meta.hidden
    await this.entityManager.save(meta)
    return '修改成功'
  }

  async updateOrderBatch(dto: UpdateOrderBatchDto) {
    const { batch } = dto

    if (batch.length === 0) {
      return;
    }

    try {
      await this.dataSource.transaction(async manager => {
        for (const item of batch) {
          const menu = await this.menuRepo.findOne({
            where: { id: item.id },
            relations: ['meta']
          })
          const parent = new Menu()
          parent.id = item.parentId
          menu.parent = item.parentId ? parent : null
          await manager.save(menu)
          const meta = menu.meta
          meta.orderNo = item.orderNo
          await manager.save(meta)
        }
      })
      return '修改成功'
    } catch (error) {
      console.log(error)
      return '修改失败'
    }
  }
}
