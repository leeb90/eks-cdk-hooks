import * as cdk from '@aws-cdk/core';

import * as eks from '@aws-cdk/aws-eks';

import * as ec2 from "@aws-cdk/aws-ec2";

export class CdkIacStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, 'express-eks', {
      version: eks.KubernetesVersion.V1_21,
      defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.SMALL),
    });
    
    // apply a kubernetes manifest to the cluster
    const appLabel = { app: "express-kubernetes" };
    
    const deployment = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: { name: "express-kubernetes" },
      spec: {
        replicas: 3,
        selector: { matchLabels: appLabel },
        template: {
          metadata: { labels: appLabel },
          spec: {
            containers: [
              {
                name: "express-kubernetes",
                image: "350516530567.dkr.ecr.us-east-1.amazonaws.com/ecr-eks-cdk:35343112e8a203299e8a77bee6a65c2a705f3918",
                ports: [ { containerPort: 8080 } ]
              }
            ]
          }
        }
      }
    };
    
    const service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: { name: "express-kubernetes" },
      spec: {
        type: "LoadBalancer",
        ports: [ { port: 80, targetPort: 8080 } ],
        selector: appLabel
      }
    };
    

    cluster.addManifest('express-kub', service, deployment);


  }
}
