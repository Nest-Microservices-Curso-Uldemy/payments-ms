import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';

export class PaymentSessionDto {
	@IsString()
	public orderId: string;

	@IsString()
	public currency: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => PaymentSessionItemsDto)
	public items: PaymentSessionItemsDto[];
}

export class PaymentSessionItemsDto {
	@IsString()
	public name: string;

	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	public price: number;

	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	public quantity: number;
}
