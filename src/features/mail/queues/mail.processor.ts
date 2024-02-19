import { MailerService } from "@nestjs-modules/mailer";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { QUEUE_MAIL } from "src/common/constants";

@Processor(QUEUE_MAIL)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailerService: MailerService
  ) {
    super()
  }

  async process(job: Job<any, any, string>, token?: string): Promise<any> {
    this.logger.log(`Sending email on ${QUEUE_MAIL}, Job with id: ${job.id} and args: ${JSON.stringify(job.data)}`);
    await this.mailerService.sendMail(job.data)
  }

  @OnWorkerEvent('completed')
  async onCompleted({ id, data }: { id: string; data: object }) {
    this.logger.log(`Completed event on ${QUEUE_MAIL}, Job with id: ${id} and args: ${JSON.stringify(data)}`);
  }

  @OnWorkerEvent('failed')
  onFailed({ id, data }: { id: string; data: number | object }) {
    this.logger.error(`Failed event on ${QUEUE_MAIL}, Job with id: ${id} and args: ${JSON.stringify(data)}`);
  }
}
