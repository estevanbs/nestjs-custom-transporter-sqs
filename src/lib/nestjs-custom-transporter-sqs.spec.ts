import { nestjsCustomTransporterSqs } from './nestjs-custom-transporter-sqs';

describe('nestjsCustomTransporterSqs', () => {
  it('should work', () => {
    expect(nestjsCustomTransporterSqs()).toEqual(
      'nestjs-custom-transporter-sqs'
    );
  });
});
