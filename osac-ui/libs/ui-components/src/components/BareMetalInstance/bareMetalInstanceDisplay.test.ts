import { create } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';

import { ExternalIPAttachmentSchema, ExternalIPAttachmentState } from '@osac/types';

import {
  buildBareMetalSshHostByInstanceId,
  getHostFromAttachments,
} from './bareMetalInstanceDisplay';

describe('bareMetalInstanceDisplay', () => {
  it('resolves external IP from ready attachments', () => {
    const attachments = [
      create(ExternalIPAttachmentSchema, {
        status: {
          state: ExternalIPAttachmentState.EXTERNAL_IP_ATTACHMENT_STATE_PENDING,
          externalIpAddress: '203.0.113.1',
        },
      }),
      create(ExternalIPAttachmentSchema, {
        metadata: { labels: { 'osac.openshift.io/auto-created': 'true' } },
        status: {
          state: ExternalIPAttachmentState.EXTERNAL_IP_ATTACHMENT_STATE_READY,
          externalIpAddress: '203.0.113.23',
        },
      }),
    ];

    expect(getHostFromAttachments(attachments)).toBe('203.0.113.23');
  });

  it('indexes SSH hosts by bare metal instance id', () => {
    const attachments = [
      create(ExternalIPAttachmentSchema, {
        spec: {
          externalIp: { id: 'eip-1' },
          target: { case: 'baremetalInstance', value: { id: 'bmi-1' } },
        },
        status: {
          state: ExternalIPAttachmentState.EXTERNAL_IP_ATTACHMENT_STATE_READY,
          externalIpAddress: '203.0.113.10',
        },
      }),
      create(ExternalIPAttachmentSchema, {
        spec: {
          externalIp: { id: 'eip-2' },
          target: { case: 'baremetalInstance', value: { id: 'bmi-2' } },
        },
        status: {
          state: ExternalIPAttachmentState.EXTERNAL_IP_ATTACHMENT_STATE_READY,
          externalIpAddress: '203.0.113.20',
        },
      }),
    ];

    expect(buildBareMetalSshHostByInstanceId(attachments)).toEqual(
      new Map([
        ['bmi-1', '203.0.113.10'],
        ['bmi-2', '203.0.113.20'],
      ]),
    );
  });
});
