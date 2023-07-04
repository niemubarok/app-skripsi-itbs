export default class ReplyService {
    public static async reply(message: string | string[], source: string = '', type: string = 'text') {
        return {
            message: JSON.stringify(message),
            source,
            type
        }

    }
    public static async replyMedia(message: string | string[], source: string = '', type: string = 'media') {
        return {
            message,
            source,
            type
        }

    }

    // public static async sendLink()
}