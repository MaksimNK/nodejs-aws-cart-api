import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';

export class CardServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nestLambda = new NodejsFunction(this, 'NestJsLambda', {
      runtime: Runtime.NODEJS_18_X,
      entry: join(__dirname, '../../dist/lambda.ts'),
      handler: 'handler',
      memorySize: 512,
      timeout: cdk.Duration.seconds(15),
      bundling: {
        externalModules: ['@nestjs/core', '@nestjs/common', 'aws-sdk'],
      },
    });

    const url = nestLambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'LambdaFunctionUrl', {
      value: url.url,
    });
  }
}
