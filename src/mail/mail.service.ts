import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendActivationLink(recepientEmail: string, activationLink: string): Promise<void> {
    console.log(`Sending activation link to ${recepientEmail} with link ${activationLink}`);
  }
}
