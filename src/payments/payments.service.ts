import { Injectable, Logger, RawBodyRequest } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
	private readonly stripe = new Stripe(envs.stripeSecret);
	private readonly logger = new Logger(PaymentsService.name);

	async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
		const { currency, items, orderId } = paymentSessionDto;

		const lineItems = items.map((item) => {
			return {
				price_data: {
					currency: currency,
					product_data: {
						name: item.name,
					},
					unit_amount: Math.round(item.price * 100),
				},
				quantity: item.quantity,
			};
		});

		const session = await this.stripe.checkout.sessions.create({
			payment_intent_data: {
				metadata: { orderId },
			},
			line_items: lineItems,
			mode: 'payment',
			success_url: envs.stripeSuccessUrl,
			cancel_url: envs.stripeCancelUrl,
		});

		return session;
	}

	async stripeWebook(request: RawBodyRequest<Request>, response: Response) {
		const sig = request.headers['stripe-signature'];
		let event: Stripe.Event;
		const endpointSecret = envs.stripeEndpointSecret;
		try {
			event = this.stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
		} catch (error) {
			return response.status(400).send(`Webhook Error: ${error.message}`);
		}

		switch (event.type) {
			case 'charge.succeeded':
				// TODO llamar nuestro microservicio
				const chargeSucceeded = event.data.object;
				console.log({
					metadata: chargeSucceeded.metadata,
					orderId: chargeSucceeded.metadata.orderId,
				});
			default:
				this.logger.log(`Event ${event.type} not handled`);
		}

		return response.status(200).json({ sig });
	}
}
