import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'

import { Currency, DocumentType, StockTransaction } from 'src/common'
import { Supplier } from 'src/suppliers/entities/supplier.entity'
import { Client } from 'src/client/entities/client.entity'

import { PurchaseItem } from './purchase-item.entity'

@Entity('purchases')
export class Purchase implements StockTransaction {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		name: 'document_type',
		type: 'enum',
		enum: DocumentType,
		default: DocumentType.None,
	})
	documentType?: DocumentType

	@Column('text', { nullable: true })
	invoiceNumber?: string

	@Column('text', { nullable: true })
	controlNumber?: string

	@Column('timestamptz')
	date: Date

	@Column({
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0,
	})
	total: number

	@Column({
		type: 'enum',
		enum: Currency,
	})
	currency: Currency

	@Column({
		name: 'currency_exchange_from',
		type: 'enum',
		enum: Currency,
	})
	currencyExchangeFrom: Currency

	@Column({
		name: 'currency_exchange_to',
		type: 'enum',
		enum: Currency,
	})
	currencyExchangeTo: Currency

	@Column({
		type: 'decimal',
		precision: 10,
		scale: 2,
	})
	exchangeRate: number

	@Column('jsonb', { default: '{}' })
	metadata?: Record<string, any>

	@Column('text', { nullable: true })
	comment?: string

	@Column({
		name: 'is_active',
		type: 'boolean',
		default: true,
	})
	isActive: boolean

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamptz',
	})
	createdAt: Date

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamptz',
	})
	updatedAt: Date

	/* Relations */

	@OneToMany(() => PurchaseItem, purchaseItem => purchaseItem.purchase)
	purchaseItems: PurchaseItem[]

	@ManyToOne(() => Supplier, { nullable: false })
	@JoinColumn({ name: 'supplier_id' })
	supplier: Supplier

	supplierId?: number

	@ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'client_id' })
	client: Client

	clientId?: string

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		if (this.invoiceNumber) this.invoiceNumber = this.invoiceNumber.trim()
		if (this.controlNumber) this.controlNumber = this.controlNumber.trim()
		if (this.comment) this.comment = this.comment.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
