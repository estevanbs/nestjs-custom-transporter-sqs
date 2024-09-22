# NestjsCustomTransporterSqs

[NestJS custom transporter](https://docs.nestjs.com/microservices/custom-transport) for [Amazon Simple Queue Service (SQS)](https://aws.amazon.com/pt/sqs/).

## How to use

Install this package with
```bash
npm i nestjs-custom-transporter-sqs
```

Configure and use the transporter in the main.ts file on the microservice:
```typescript
import { ServerSqs } from 'nestjs-custom-transporter-sqs'

const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new ServerSqs({
      queueUrl: QUEUE_URL_HERE,
      awsRegion: AWS_REGION_HERE
    }),
  }
);
```

Create a handler to handle the messages:
```typescript
@EventPattern('myHandler')
myHandler(@Payload() data: any, @Ctx() context: SqsContext) {
  console.log('It worked!')
}
```

Send a message to the queue with a handler on the body:
```json
{
  "handler": "myHandler",
    "data": {
    "foo": "bar"
  }
}
```

The `handler` property on the message is the `EventPattern` of the handler funcion.

## Transporter options
| Option                   | Description                                                                                                                                         | Default value |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| queueUrl                 | Queue url                                                                                                                                           |               |
| awsRegion                | Queue region                                                                                                                                        |               |
| autoDeleteMessage        | If true, auto delete the message on aws after processing                                                                                            | true          |
| messageVisibilityTimeout | The duration (in seconds) that the received messages are hidden from subsequent retrieve requests after being retrieved by a ReceiveMessage request | 60            |
| maxNumberOfMessages      | The maximum number of messages to return per request on sqs                                                                                         | 10            |
| waitTimeSeconds          | The duration (in seconds) for which the call waits for a message to arrive in the queue before returning                                            | 20            |
