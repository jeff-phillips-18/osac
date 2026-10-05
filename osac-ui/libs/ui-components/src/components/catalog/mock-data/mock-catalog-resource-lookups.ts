import { create } from '@bufbuild/protobuf';

import {
  BareMetalInstanceTypeSchema,
  ClusterVersionSchema,
  ClusterVersionState,
  DiskImageSchema,
  GuestOSFamily,
  HostTypeSchema,
  InstanceTypeSchema,
  InstanceTypeState,
} from '@osac/types';

import type { CatalogItemResourceLookups } from '../catalogItemResourceLookups.types';
import {
  MOCK_BM_INSTANCE_TYPE_IDS,
  MOCK_CLUSTER_VERSION_IDS,
  MOCK_COMPUTE_INSTANCE_TYPE_IDS,
  MOCK_DISK_IMAGE_IDS,
  MOCK_HOST_TYPE_IDS,
} from './shared';

/** Resource lookup lists paired with mock VM, cluster, and bare metal catalog items. */
export const mockCatalogItemResourceLookups = (): CatalogItemResourceLookups => ({
  diskImages: [
    create(DiskImageSchema, {
      id: MOCK_DISK_IMAGE_IDS.rhel94,
      metadata: { name: 'RHEL 9.4', displayName: 'RHEL 9.4' },
      spec: { guestOsFamily: GuestOSFamily.GUEST_OS_FAMILY_LINUX },
    }),
    create(DiskImageSchema, {
      id: MOCK_DISK_IMAGE_IDS.rhel96,
      metadata: { name: 'RHEL 9.6', displayName: 'RHEL 9.6' },
      spec: { guestOsFamily: GuestOSFamily.GUEST_OS_FAMILY_LINUX },
    }),
    create(DiskImageSchema, {
      id: MOCK_DISK_IMAGE_IDS.centos,
      metadata: { name: 'CentOS Stream 9', displayName: 'CentOS Stream 9' },
      spec: { guestOsFamily: GuestOSFamily.GUEST_OS_FAMILY_LINUX },
    }),
    create(DiskImageSchema, {
      id: MOCK_DISK_IMAGE_IDS.rhel10,
      metadata: { name: 'RHEL 10', displayName: 'RHEL 10' },
      spec: { guestOsFamily: GuestOSFamily.GUEST_OS_FAMILY_LINUX },
    }),
  ],
  computeInstanceTypes: [
    create(InstanceTypeSchema, {
      id: MOCK_COMPUTE_INSTANCE_TYPE_IDS.standard48,
      metadata: { name: 'standard-4-8', displayName: 'Standard 4 vCPU / 8 GiB' },
      spec: { vcpus: 4, memoryGib: 8, state: InstanceTypeState.ACTIVE },
    }),
    create(InstanceTypeSchema, {
      id: MOCK_COMPUTE_INSTANCE_TYPE_IDS.standard416,
      metadata: { name: 'standard-4-16', displayName: 'Standard 4 vCPU / 16 GiB' },
      spec: { vcpus: 4, memoryGib: 16, state: InstanceTypeState.ACTIVE },
    }),
  ],
  bareMetalInstanceTypes: [
    create(BareMetalInstanceTypeSchema, {
      id: MOCK_BM_INSTANCE_TYPE_IDS.largeGpu,
      metadata: { name: 'large-gpu', displayName: 'Large' },
      spec: {
        hardware: {
          cpu: { cores: 64 },
          memory: { totalGb: 512n },
          accelerators: [
            {
              vendor: 'NVIDIA',
              model: 'A100',
              memoryGb: 80,
            },
          ],
          disks: [],
          networkPorts: [],
          capabilities: {},
        },
      },
    }),
    create(BareMetalInstanceTypeSchema, {
      id: MOCK_BM_INSTANCE_TYPE_IDS.medium,
      metadata: { name: 'medium', displayName: 'Medium' },
      spec: {
        hardware: {
          cpu: { cores: 32 },
          memory: { totalGb: 256n },
          accelerators: [],
          disks: [],
          networkPorts: [],
          capabilities: {},
        },
      },
    }),
    create(BareMetalInstanceTypeSchema, {
      id: MOCK_BM_INSTANCE_TYPE_IDS.small,
      metadata: { name: 'small', displayName: 'Small' },
      spec: {
        hardware: {
          cpu: { cores: 8 },
          memory: { totalGb: 64n },
          accelerators: [],
          disks: [],
          networkPorts: [],
          capabilities: {},
        },
      },
    }),
  ],
  clusterVersions: [
    create(ClusterVersionSchema, {
      id: MOCK_CLUSTER_VERSION_IDS.oc419,
      metadata: { name: '4-19-0' },
      spec: { version: '4.19.0', state: ClusterVersionState.ACTIVE, enabled: true },
    }),
    create(ClusterVersionSchema, {
      id: MOCK_CLUSTER_VERSION_IDS.oc417,
      metadata: { name: '4-17-0' },
      spec: { version: '4.17.0', state: ClusterVersionState.ACTIVE, enabled: true },
    }),
    create(ClusterVersionSchema, {
      id: MOCK_CLUSTER_VERSION_IDS.oc416,
      metadata: { name: '4-16-0' },
      spec: { version: '4.16.0', state: ClusterVersionState.ACTIVE, enabled: true },
    }),
  ],
  hostTypes: [
    create(HostTypeSchema, {
      id: MOCK_HOST_TYPE_IDS.bmCpu64c,
      metadata: { name: 'bm-cpu-64c' },
      title: '',
      description: '',
      interfaces: [],
    }),
    create(HostTypeSchema, {
      id: MOCK_HOST_TYPE_IDS.bmCpu32c,
      metadata: { name: 'bm-cpu-32c' },
      title: '',
      description: '',
      interfaces: [],
    }),
    create(HostTypeSchema, {
      id: MOCK_HOST_TYPE_IDS.bmGpuH100,
      metadata: { name: 'bm-gpu-h100' },
      title: '',
      description: '',
      interfaces: [],
    }),
    create(HostTypeSchema, {
      id: MOCK_HOST_TYPE_IDS.standard,
      metadata: { name: 'standard-worker' },
      title: 'Standard worker',
      description: '',
      interfaces: [],
    }),
    create(HostTypeSchema, {
      id: MOCK_HOST_TYPE_IDS.gpu,
      metadata: { name: 'gpu-worker' },
      title: 'GPU worker',
      description: '',
      interfaces: [],
    }),
  ],
});

/** @deprecated Use `mockCatalogItemResourceLookups`. */
export const mockBareMetalCatalogItemResourceLookups = mockCatalogItemResourceLookups;
