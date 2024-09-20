import {
  CustomTransportStrategy,
  Server,
} from '@nestjs/microservices';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { SqsContext } from '../ctx-host/sqs.context';
import { SqsOptions } from '../../interfaces/sqs-options.interface';
import {
  SQS_DEFAULT_AUTO_DELETE_MESSAGE,
  SQS_DEFAULT_MAX_NUMBER_OF_MESSAGES,
  SQS_DEFAULT_MESSAGE_VISIBILITY_TIMEOUT,
  SQS_DEFAULT_WAIT_TIME_SECONDS,
} from '../../constants';

export class ServerSqs extends Server implements CustomTransportStrategy {
  private sqsClient: SQSClient;

  protected readonly queueUrl: string;
  protected readonly awsRegion: string;
  protected readonly messageVisibilityTimeout: number;
  protected readonly autoDeleteMessage: boolean;
  protected readonly maxNumberOfMessages: number;
  protected readonly waitTimeSeconds: number;
  constructor(protected readonly options: SqsOptions) {
    super();

    this.queueUrl = this.getOptionsProp(this.options, 'queueUrl');
    this.awsRegion = this.getOptionsProp(this.options, 'awsRegion');
    this.messageVisibilityTimeout =
      this.getOptionsProp(this.options, 'messageVisibilityTimeout') ||
      SQS_DEFAULT_MESSAGE_VISIBILITY_TIMEOUT;
    this.autoDeleteMessage = this.getOptionsProp(
      this.options,
      'autoDeleteMessage',
      SQS_DEFAULT_AUTO_DELETE_MESSAGE
    )!;
    this.maxNumberOfMessages =
      this.getOptionsProp(this.options, 'maxNumberOfMessages') ||
      SQS_DEFAULT_MAX_NUMBER_OF_MESSAGES;
    this.waitTimeSeconds =
      this.getOptionsProp(this.options, 'waitTimeSeconds') ||
      SQS_DEFAULT_WAIT_TIME_SECONDS;

    this.sqsClient = new SQSClient({ region: options.awsRegion });
  }

  close() {
    this.sqsClient.destroy();
  }

  listen(callback: () => void) {
    this.start(callback);
  }

  public listerForMessages() {
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: this.maxNumberOfMessages,
      WaitTimeSeconds: this.waitTimeSeconds,
      VisibilityTimeout: this.messageVisibilityTimeout,
    });

    this.sqsClient.send(receiveMessageCommand).then((response) => {
      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          this.messageHandlers.forEach(async (handler, pattern) => {
            // only handling `@EventPattern()`s for now
            if (handler.isEventHandler) {
              if (!message.Body) {
                this.logger.error('SQS message does not contain a body');
                return;
              }

              const messageBody = JSON.parse(message.Body);
              if (!messageBody.handler) {
                this.logger.error(
                  'SQS message does not contain the field "handler" on root'
                );
                return;
              }

              if (pattern === messageBody.handler) {
                const sqsContext = new SqsContext([
                  message,
                  this.queueUrl,
                  pattern,
                ]);
                await handler(messageBody.data, sqsContext);

                if (this.autoDeleteMessage) {
                  const deleteMessageCommand = new DeleteMessageCommand({
                    QueueUrl: this.queueUrl,
                    ReceiptHandle: message.ReceiptHandle,
                  });
                  await this.sqsClient.send(deleteMessageCommand);
                }
              }
            }
          });
        }
      }

      this.listerForMessages();
    });
  }

  public start(callback: () => void) {
    this.listerForMessages();
    callback();
  }
}
