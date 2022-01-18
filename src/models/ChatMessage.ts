export class ChatMessage {
    sender: string;
    message: string;

    constructor(sender: string, message: string) {
        this.sender = sender;
        this.message = message;
    }
}