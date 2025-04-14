#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CardServiceStack } from '../lib/card-service-stack';

const app = new cdk.App();
new CardServiceStack(app, 'CardServiceStack');
