import { BaseRpcContext } from '@nestjs/microservices';
import { Message } from '@aws-sdk/client-sqs';

type SqsContextArgs = [Message, string, string];

export class SqsContext extends BaseRpcContext<SqsContextArgs> {
  constructor(args: SqsContextArgs) {
    super(args);
  }

  /**
   * Returns the original sqs message.
   */
  getMessage() {
    return this.args[0];
  }

  /**
   * Returns the queue url.
   */
  getQueueUrl() {
    return this.args[1];
  }

  /**
   * Returns the name of the pattern.
   */
  getPattern() {
    return this.args[2];
  }
}
