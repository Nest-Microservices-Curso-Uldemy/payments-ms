import { Body, Controller, Get, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post('create-payment-session')
	createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
		return this.paymentsService.createPaymentSession(paymentSessionDto);
	}

	@Get('success')
	success() {
		return {
			ok: true,
			message: 'Payment successful',
		};
	}

	@Get('cancelled')
	cancel() {
		return {
			ok: false,
			message: 'Payment cancelled',
		};
	}

	@Post('webhook')
	async stripeWebhook(@Req() request: RawBodyRequest<Request>, @Res() response: Response) {
		return this.paymentsService.stripeWebook(request, response);
	}
}
