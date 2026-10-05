import { create } from '@bufbuild/protobuf';
import type { TFunction } from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  type BareMetalInstanceCatalogItemFields,
  BareMetalInstanceTypeReferenceSchema,
  BareMetalInstanceTypeSchema,
  DiskImageSchema,
  GuestOSFamily,
} from '@osac/types';

import {
  bareMetalInstanceTypeReferenceFromPolicy,
  diskImageGuestOsIconType,
  formatBareMetalCatalogGpu,
  formatBareMetalCatalogInstanceType,
} from './bareMetalCatalogItemResourceDisplay';
import { initTestI18n } from '../../test-utils/i18n';

type InstanceTypePolicy = Parameters<typeof bareMetalInstanceTypeReferenceFromPolicy>[0];

describe('bareMetalCatalogItemResourceDisplay', () => {
  let t: TFunction;

  beforeAll(async () => {
    const i18n = await initTestI18n();
    t = i18n.t.bind(i18n);
  });

  it('reads instance type references from locked and editable field policies', () => {
    const lockedRef = create(BareMetalInstanceTypeReferenceSchema, {
      id: 'bmit-1',
      name: 'large',
      project: 'default',
      shared: false,
    });
    expect(
      bareMetalInstanceTypeReferenceFromPolicy({
        behavior: { case: 'locked', value: lockedRef },
      } as InstanceTypePolicy),
    ).toEqual(lockedRef);
    expect(
      bareMetalInstanceTypeReferenceFromPolicy({
        behavior: { case: 'editable', value: { defaultValue: lockedRef } },
      } as InstanceTypePolicy),
    ).toEqual(lockedRef);
  });

  it('formats instance type label from resolved type or reference', () => {
    const lockedPolicy = {
      behavior: { case: 'locked', value: { name: 'large' } },
    } as InstanceTypePolicy;
    const instanceType = create(BareMetalInstanceTypeSchema, {
      id: 'bmit-1',
      metadata: { name: 'large', displayName: 'Large' },
    });
    const reference = create(BareMetalInstanceTypeReferenceSchema, { name: 'large' });
    const fields = { instanceType: lockedPolicy } as BareMetalInstanceCatalogItemFields;

    expect(formatBareMetalCatalogInstanceType(fields, instanceType, reference)).toBe('Large');
    expect(formatBareMetalCatalogInstanceType(fields, undefined, reference)).toBe('large');
    expect(formatBareMetalCatalogInstanceType(undefined, instanceType, reference)).toBe(undefined);
  });

  it('formats GPU details from the first accelerator', () => {
    const lockedPolicy = {
      behavior: { case: 'locked', value: { name: 'large-gpu' } },
    } as InstanceTypePolicy;
    const instanceType = create(BareMetalInstanceTypeSchema, {
      id: 'bmit-1',
      metadata: { name: 'large-gpu' },
      spec: {
        hardware: {
          cpu: { cores: 64 },
          memory: { totalGb: 512n },
          accelerators: [{ vendor: 'NVIDIA', model: 'A100', memoryGb: 80 }],
          disks: [],
          networkPorts: [],
          capabilities: {},
        },
      },
    });
    const fields = { instanceType: lockedPolicy } as BareMetalInstanceCatalogItemFields;

    expect(formatBareMetalCatalogGpu(fields, instanceType, t)).toBe('NVIDIA A100 80 GB');
  });

  it('maps disk image guest OS family and name to icon types', () => {
    const windowsImage = create(DiskImageSchema, {
      id: 'di-win',
      metadata: { name: 'Windows Server' },
      spec: { guestOsFamily: GuestOSFamily.GUEST_OS_FAMILY_WINDOWS },
    });
    const rhelImage = create(DiskImageSchema, {
      id: 'di-rhel',
      metadata: { name: 'RHEL 9.4' },
      spec: { guestOsFamily: GuestOSFamily.GUEST_OS_FAMILY_LINUX },
    });

    expect(diskImageGuestOsIconType(windowsImage)).toBe('windows');
    expect(diskImageGuestOsIconType(rhelImage)).toBe('rhel');
  });
});
