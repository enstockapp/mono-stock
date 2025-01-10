import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Stock } from '../../interfaces'
import { Status } from 'src/common'

export class StockDto implements Stock {
	@ApiProperty()
	@Min(0)
	@IsInt()
	initialQuantity: number

	@ApiProperty({
		description: `Valid: '${Status.Active}',${Status.Inactive}`,
	})
	@IsOptional()
	@IsEnum(Status)
	status?: Status
}
