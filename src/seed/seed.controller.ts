import { Controller, Post } from '@nestjs/common'
import { Auth } from 'src/auth'
import { RoleEnum } from 'src/roles'
import { SeedService } from './seed.service'

@Controller('seed')
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Post('/init')
	@Auth(RoleEnum.superAdmin)
	initSeed() {
		return this.seedService.initSeed()
	}
}
