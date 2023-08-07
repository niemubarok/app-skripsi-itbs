export default class ReplyService {
  public static async reply(message: string | string[], source: string = '', type: string = 'text') {

    return {
      message: message,
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
