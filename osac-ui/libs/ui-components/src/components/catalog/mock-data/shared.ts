import { create } from '@bufbuild/protobuf';
import type { UseQueryResult } from '@tanstack/react-query';

import { DiskImageReferenceSchema, MetadataSchema } from '@osac/types';

const mockCatalogDataEnv = import.meta.env.VITE_MOCK_CATALOG_DATA;

/** Toggle mock catalog list + resource lookup data in catalog hooks (set `VITE_MOCK_CATALOG_DATA=true`). */
export const MOCK_CATALOG_DATA =
  mockCatalogDataEnv === 'true' || mockCatalogDataEnv === '1' || mockCatalogDataEnv === 'yes';

export const MOCK_CATALOG_PROJECT = 'demo';

export const MOCK_DISK_IMAGE_IDS = {
  rhel94: 'mock-di-rhel-94',
  rhel96: 'mock-di-rhel-96',
  centos: 'mock-di-centos-stream',
  rhel10: 'mock-di-rhel-10',
} as const;

export const MOCK_COMPUTE_INSTANCE_TYPE_IDS = {
  standard48: 'mock-it-4-8',
  standard416: 'mock-it-4-16',
} as const;

export const MOCK_BM_INSTANCE_TYPE_IDS = {
  largeGpu: 'mock-bmit-large-gpu',
  medium: 'mock-bmit-medium',
  small: 'mock-bmit-small',
} as const;

export const MOCK_CLUSTER_VERSION_IDS = {
  oc419: 'mock-cv-4-19-0',
  oc417: 'mock-cv-4-17-0',
  oc416: 'mock-cv-4-16-0',
} as const;

export const MOCK_HOST_TYPE_IDS = {
  bmCpu64c: 'mock-ht-bm-cpu-64c',
  bmCpu32c: 'mock-ht-bm-cpu-32c',
  bmGpuH100: 'mock-ht-bm-gpu-h100',
  standard: 'mock-ht-standard',
  gpu: 'mock-ht-gpu',
} as const;

export const mockCatalogMetadata = (name: string, displayName = '') =>
  create(MetadataSchema, {
    name,
    displayName,
    description: '',
    creator: 'mock-data',
    annotations: {},
    labels: {},
    project: MOCK_CATALOG_PROJECT,
    tenant: MOCK_CATALOG_PROJECT,
    version: 1,
  });

export const mockDiskImageReference = (id: string, name: string) =>
  create(DiskImageReferenceSchema, {
    id,
    name,
    project: MOCK_CATALOG_PROJECT,
    shared: false,
  });

export const mockListResourceResult = <T>(
  data: T,
  overrides: Partial<UseQueryResult<T, unknown>> = {},
): UseQueryResult<T, unknown> =>
  ({
    data,
    error: null,
    isError: false,
    isLoading: false,
    isPending: false,
    isFetching: false,
    isSuccess: true,
    status: 'success',
    fetchStatus: 'idle',
    ...overrides,
  }) as UseQueryResult<T, unknown>;
