import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  SimpleSpanProcessor, // for testing
  BatchSpanProcessor, // for performance
} from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import * as process from 'process';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const otelSDK = new NodeSDK({
  serviceName: 'crossbell',
  metricReader: new PrometheusExporter({
    port: 3001,
    endpoint: '/metrics',
  }),
  spanProcessor:
    process.env.NODE_ENV === 'production'
      ? new BatchSpanProcessor(
          new JaegerExporter({
            host: process.env.JAEGER_COLLECTOR_HOST,
            port: Number(process.env.JAEGER_COLLECTOR_PORT),
            endpoint: process.env.JAEGER_COLLECTOR_ENDPOINT,
          }),
        )
      : undefined,
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new JaegerPropagator(),
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new B3Propagator(),
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      }),
    ],
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new PrismaInstrumentation({ middleware: true }),
  ],
});

export default otelSDK;
