import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { QUEUE_SMS } from "src/common/constants";
import { SmsService } from "../sms.service";

@Processor(QUEUE_SMS)
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(
    private readonly smsService: SmsService
  ) {
    super()
  }

  async process(job: Job<any, any, string>, token?: string): Promise<any> {
    this.logger.log(`Sending email on ${QUEUE_SMS}, Job with id: ${job.id} and args: ${JSON.stringify(job.data)}`);
    await this.smsService.notice(job.data.phone, job.data.context)
  }

  @OnWorkerEvent('completed')
  async onCompleted({ id, data }: { id: string; data: object }) {
    this.logger.log(`Completed event on ${QUEUE_SMS}, Job with id: ${id} and args: ${JSON.stringify(data)}`);
  }

  @OnWorkerEvent('failed')
  onFailed({ id, data }: { id: string; data: number | object }) {
    this.logger.error(`Failed event on ${QUEUE_SMS}, Job with id: ${id} and args: ${JSON.stringify(data)}`);
  }
}
