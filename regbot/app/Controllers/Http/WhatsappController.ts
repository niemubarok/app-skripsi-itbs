import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import WhatsappService from 'App/services/WhatsappService'

export default class WhatsappController {
    private whatsappService: WhatsappService

    constructor() {
        this.whatsappService = new WhatsappService()
    }

    public async connect({ response }: HttpContextContract) {

        try {
            await this.whatsappService.connect()
            response.send({ message: 'Connected to WhatsApp API' })
        } catch (error) {
            response.status(500).send({ error: error.message })
        }
    }

    public async sendMessage({ request, response }: HttpContextContract) {
        try {
            const { phoneNumber, message } = request.only(['phoneNumber', 'message']);
            if (!phoneNumber || !message) {
                throw new Error('Missing required parameters');
            }
            return await this.whatsappService.sendMessage(phoneNumber, message);
            response.send({ message: 'Message sent' });
        } catch (error) {
            response.status(500).send({ error: error.message });
        }
    }

    public async onMessage({ response }: HttpContextContract) {
        await this.whatsappService.onMessage((message) => {
            response.send({ message: message.body })
        })
    }
}
