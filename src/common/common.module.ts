import { Module } from '@nestjs/common'
import { EncryptAdapter, HandleErrorAdapter } from './adapters'

@Module({
	providers: [EncryptAdapter, HandleErrorAdapter],
	exports: [EncryptAdapter, HandleErrorAdapter],
})
export class CommonModule {}
