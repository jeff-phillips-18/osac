import { create } from '@bufbuild/protobuf';
import type { TFunction } from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  type ComputeInstanceCatalogItemFields,
  InstanceTypeReferenceSchema,
  InstanceTypeSchema,
} from '@osac/types';

import {
  computeDiskImageReferenceFromPolicy,
  computeInstanceTypeReferenceFromPolicy,
  formatComputeCatalogInstanceType,
  formatComputeCatalogMemory,
  formatComputeCatalogStorage,
  formatComputeCatalogVCpu,
  int32ValueFromPolicy,
} from './computeCatalogItemResourceDisplay';
import { initTestI18n } from '../../test-utils/i18n';

type Int32Policy = Parameters<typeof int32ValueFromPolicy>[0];
type InstanceTypePolicy = Parameters<typeof computeInstanceTypeReferenceFromPolicy>[0];
type DiskImagePolicy = Parameters<typeof computeDiskImageReferenceFromPolicy>[0];

describe('computeCatalogItemResourceDisplay', () => {
  let t: TFunction;

  beforeAll(async () => {
    const i18n = await initTestI18n();
    t = i18n.t.bind(i18n);
  });

  it('reads locked and editable int32 field policies', () => {
    expect(int32ValueFromPolicy({ behavior: { case: 'locked', value: 40 } } as Int32Policy)).toBe(
      40,
    );
    expect(
      int32ValueFromPolicy({
        behavior: { case: 'editable', value: { defaultValue: 80 } },
      } as Int32Policy),
    ).toBe(80);
    expect(int32ValueFromPolicy(undefined)).toBeUndefined();
  });

  it('reads instance type and disk image references from field policies', () => {
    const lockedRef = { id: 'it-1', name: 'standard-4-8', project: 'default', shared: false };
    expect(
      computeInstanceTypeReferenceFromPolicy({
        behavior: { case: 'locked', value: lockedRef },
      } as InstanceTypePolicy),
    ).toEqual(lockedRef);
    expect(
      computeInstanceTypeReferenceFromPolicy({
        behavior: { case: 'editable', value: { defaultValue: lockedRef } },
      } as InstanceTypePolicy),
    ).toEqual(lockedRef);

    const diskRef = { id: 'di-1', name: 'RHEL 10', project: 'default', shared: false };
    expect(
      computeDiskImageReferenceFromPolicy({
        behavior: { case: 'locked', value: diskRef },
      } as DiskImagePolicy),
    ).toEqual(diskRef);
  });

  it('formats instance type label from resolved type or reference', () => {
    const lockedPolicy = {
      behavior: { case: 'locked', value: { id: 'it-1', name: 'standard-4-8' } },
    } as InstanceTypePolicy;
    const instanceType = create(InstanceTypeSchema, {
      id: 'it-1',
      metadata: { name: 'standard-4-8', displayName: 'Standard 4 vCPU / 8 GiB' },
    });
    const reference = create(InstanceTypeReferenceSchema, { name: 'standard-4-8' });
    const fields = { instanceType: lockedPolicy } as ComputeInstanceCatalogItemFields;

    expect(formatComputeCatalogInstanceType(fields, instanceType, reference)).toBe(
      'Standard 4 vCPU / 8 GiB',
    );
    expect(formatComputeCatalogInstanceType(fields, undefined, reference)).toBe('standard-4-8');
    expect(formatComputeCatalogInstanceType(undefined, instanceType, reference)).toBe(undefined);
  });

  it('formats vCPU, memory, and boot disk size from configured field policies', () => {
    const lockedInstanceTypePolicy = {
      behavior: { case: 'locked', value: { name: 'standard-4-8' } },
    } as InstanceTypePolicy;
    const lockedBootDiskPolicy = {
      behavior: { case: 'locked', value: 40 },
    } as Int32Policy;
    const instanceType = create(InstanceTypeSchema, {
      id: 'it-1',
      metadata: { name: 'standard-4-8' },
      spec: { vcpus: 4, memoryGib: 8 },
    });
    const fields = {
      instanceType: lockedInstanceTypePolicy,
      bootDisk: { sizeGib: lockedBootDiskPolicy },
    } as ComputeInstanceCatalogItemFields;

    expect(formatComputeCatalogVCpu(fields, instanceType, t)).toBe('4 vCPU');
    expect(formatComputeCatalogMemory(fields, instanceType, t)).toBe('8 GiB');
    expect(formatComputeCatalogStorage(fields, 40, t)).toBe('40 GiB');
  });
});
