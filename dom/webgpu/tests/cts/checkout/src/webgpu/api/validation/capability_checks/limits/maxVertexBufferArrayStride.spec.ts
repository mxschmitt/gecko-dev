import { roundDown } from '../../../../util/math.js';

import {
  kMaximumLimitBaseParams,
  makeLimitTestGroup,
  MaximumLimitValueTest,
  MaximumTestValue,
} from './limit_utils.js';

function getPipelineDescriptor(device: GPUDevice, testValue: number): GPURenderPipelineDescriptor {
  const code = `
  @vertex fn vs(@location(0) v: f32) -> @builtin(position) vec4f {
    return vec4f(v);
  }
  `;
  const module = device.createShaderModule({ code });
  return {
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        {
          arrayStride: testValue,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32',
            },
          ],
        },
      ],
    },
  };
}

const kMinAttributeStride = 4;

function getDeviceLimitToRequest(
  limitValueTest: MaximumLimitValueTest,
  defaultLimit: number,
  maximumLimit: number
) {
  switch (limitValueTest) {
    case 'atDefault':
      return defaultLimit;
    case 'underDefault':
      return defaultLimit - kMinAttributeStride;
    case 'betweenDefaultAndMaximum':
      return Math.min(
        defaultLimit,
        roundDown(Math.floor((defaultLimit + maximumLimit) / 2), kMinAttributeStride)
      );
    case 'atMaximum':
      return maximumLimit;
    case 'overMaximum':
      return maximumLimit + kMinAttributeStride;
  }
}

function getTestValue(testValueName: MaximumTestValue, requestedLimit: number) {
  switch (testValueName) {
    case 'atLimit':
      return requestedLimit;
    case 'overLimit':
      return requestedLimit + kMinAttributeStride;
  }
}

function getDeviceLimitToRequestAndValueToTest(
  limitValueTest: MaximumLimitValueTest,
  testValueName: MaximumTestValue,
  defaultLimit: number,
  maximumLimit: number
) {
  const requestedLimit = getDeviceLimitToRequest(limitValueTest, defaultLimit, maximumLimit);
  return {
    requestedLimit,
    testValue: getTestValue(testValueName, requestedLimit),
  };
}

/*
Note: We need to request +4 (vs the default +1) because otherwise we may trigger the wrong validation
of the arrayStride not being a multiple of 4
*/
const limit = 'maxVertexBufferArrayStride';
export const { g, description } = makeLimitTestGroup(limit);

g.test('createRenderPipeline,at_over')
  .desc(`Test using createRenderPipeline(Async) at and over ${limit} limit`)
  .params(kMaximumLimitBaseParams.combine('async', [false, true]))
  .fn(async t => {
    const { limitTest, testValueName, async } = t.params;
    const { defaultLimit, adapterLimit: maximumLimit } = t;
    const { requestedLimit, testValue } = getDeviceLimitToRequestAndValueToTest(
      limitTest,
      testValueName,
      defaultLimit,
      maximumLimit
    );

    await t.testDeviceWithSpecificLimits(
      requestedLimit,
      testValue,
      async ({ device, testValue, shouldError }) => {
        const pipelineDescriptor = getPipelineDescriptor(device, testValue);

        await t.testCreateRenderPipeline(pipelineDescriptor, async, shouldError);
      }
    );
  });
