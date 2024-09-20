export interface SqsOptions {
  /**
   * Queue url
   */
  queueUrl: string;

  /**
   * Queue region on AWS.
   */
  awsRegion: string;

  /**
   * The duration (in seconds) that the received messages are hidden from subsequent retrieve requests after being retrieved by a ReceiveMessage request. Default: 60.
   */
  messageVisibilityTimeout?: number;

  /**
   * If true, auto delete the message on aws after processing. Default: true.
   */
  autoDeleteMessage?: boolean;

  /**
   * The maximum number of messages to return per request on sqs. Default: 10.
   */
  maxNumberOfMessages?: number;

  /**
   * The duration (in seconds) for which the call waits for a message to arrive in the queue before returning. Default: 20.
   */
  waitTimeSeconds?: number;
}
