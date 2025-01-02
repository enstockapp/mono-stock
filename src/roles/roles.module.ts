import { Module } from '@nestjs/common'
import { CommonModule } from 'src/common/common.module'
import { Permission, Role } from './entities'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RolesService } from './roles.service'
import { PermissionsService } from './permissions.service'

@Module({
	providers: [RolesService, PermissionsService],
	controllers: [],
	imports: [TypeOrmModule.forFeature([Role, Permission]), CommonModule],
	exports: [RolesService, PermissionsService],
})
export class RolesModule {}
