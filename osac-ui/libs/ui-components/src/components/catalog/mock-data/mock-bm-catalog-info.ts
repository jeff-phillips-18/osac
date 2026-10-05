import { create } from '@bufbuild/protobuf';

import {
  BareMetalInstanceCatalogItem,
  type BareMetalInstanceCatalogItemFields,
  BareMetalInstanceCatalogItemSchema,
  type BareMetalInstanceCatalogItemsListResponse,
  BareMetalInstanceCatalogItemsListResponseSchema,
  BareMetalInstanceTypeReferenceSchema,
} from '@osac/types';

import {
  MOCK_BM_INSTANCE_TYPE_IDS,
  MOCK_CATALOG_PROJECT,
  MOCK_DISK_IMAGE_IDS,
  mockCatalogMetadata,
  mockDiskImageReference,
  mockListResourceResult,
} from './shared';

/** @deprecated Use `MOCK_CATALOG_PROJECT` from `./shared`. */
export const MOCK_BM_CATALOG_PROJECT = MOCK_CATALOG_PROJECT;

export { MOCK_BM_INSTANCE_TYPE_IDS };

/** @deprecated Use `MOCK_DISK_IMAGE_IDS` from `./shared`. */
export const MOCK_BM_DISK_IMAGE_IDS = {
  rhel94: 'mock-di-rhel-94',
  rhel96: 'mock-di-rhel-96',
  centos: 'mock-di-centos-stream',
} as const;

const mockBareMetalInstanceTypeReference = (id: string, name: string) =>
  create(BareMetalInstanceTypeReferenceSchema, {
    id,
    name,
    project: MOCK_CATALOG_PROJECT,
    shared: false,
  });

const lockedInstanceTypePolicy = (id: string, name: string) => ({
  behavior: {
    case: 'locked' as const,
    value: mockBareMetalInstanceTypeReference(id, name),
  },
});

const editableInstanceTypePolicy = (id: string, name: string) => ({
  behavior: {
    case: 'editable' as const,
    value: {
      defaultValue: mockBareMetalInstanceTypeReference(id, name),
    },
  },
});

const lockedDiskImagePolicy = (id: string, name: string) => ({
  behavior: {
    case: 'locked' as const,
    value: mockDiskImageReference(id, name),
  },
});

const editableDiskImagePolicy = (id: string, name: string) => ({
  behavior: {
    case: 'editable' as const,
    value: {
      defaultValue: mockDiskImageReference(id, name),
    },
  },
});

const mockBareMetalCatalogItem = (
  id: string,
  name: string,
  options: {
    title: string;
    description: string;
    published?: boolean;
    fields?: BareMetalInstanceCatalogItemFields;
  },
): BareMetalInstanceCatalogItem =>
  create(BareMetalInstanceCatalogItemSchema, {
    id,
    metadata: mockCatalogMetadata(name),
    title: options.title,
    description: options.description,
    template: { id: `tpl-${name}` },
    published: options.published ?? true,
    templateParameters: {},
    fields: options.fields,
  });

/**
 * Five bare metal catalog items covering `BareMetalCatalogItemResources` UI variants:
 *
 * 1. Locked GPU instance type + editable OS image (nested CPU/RAM/GPU + Editable badge on OS).
 * 2. Editable instance type + locked OS image.
 * 3. Locked instance type without GPU accelerators (GPU row shows "-").
 * 4. No instance type policy (no nested hardware block; OS image only).
 * 5. Unpublished item with locked instance type and locked OS image.
 */
export const mockBareMetalInstanceCatalogItems = (): BareMetalInstanceCatalogItem[] => [
  mockBareMetalCatalogItem('bm-catalog-gpu-large', 'bm-catalog-gpu-large', {
    title: 'GPU bare metal (Large)',
    description: 'Locked Large instance type with editable RHEL OS image.',
    fields: {
      instanceType: lockedInstanceTypePolicy(MOCK_BM_INSTANCE_TYPE_IDS.largeGpu, 'large-gpu'),
      diskImage: editableDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel94, 'RHEL 9.4'),
    } as BareMetalInstanceCatalogItemFields,
  }),
  mockBareMetalCatalogItem('bm-catalog-flexible', 'bm-catalog-flexible', {
    title: 'Flexible bare metal',
    description: 'Editable instance type with locked OS image.',
    fields: {
      instanceType: editableInstanceTypePolicy(MOCK_BM_INSTANCE_TYPE_IDS.medium, 'medium'),
      diskImage: lockedDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel96, 'RHEL 9.6'),
    } as BareMetalInstanceCatalogItemFields,
  }),
  mockBareMetalCatalogItem('bm-catalog-compute', 'bm-catalog-compute', {
    title: 'Compute bare metal',
    description: 'Locked small instance type without GPU; locked CentOS Stream OS.',
    fields: {
      instanceType: lockedInstanceTypePolicy(MOCK_BM_INSTANCE_TYPE_IDS.small, 'small'),
      diskImage: lockedDiskImagePolicy(MOCK_DISK_IMAGE_IDS.centos, 'CentOS Stream 9'),
    } as BareMetalInstanceCatalogItemFields,
  }),
  mockBareMetalCatalogItem('bm-catalog-os-only', 'bm-catalog-os-only', {
    title: 'OS image only',
    description: 'No instance type field policy — hardware section hidden.',
    fields: {
      diskImage: editableDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel94, 'RHEL 9.4'),
    } as BareMetalInstanceCatalogItemFields,
  }),
  mockBareMetalCatalogItem('bm-catalog-draft', 'bm-catalog-draft', {
    title: 'Draft GPU offering',
    description: 'Unpublished catalog item with locked instance type and OS image.',
    published: false,
    fields: {
      instanceType: lockedInstanceTypePolicy(MOCK_BM_INSTANCE_TYPE_IDS.largeGpu, 'large-gpu'),
      diskImage: lockedDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel94, 'RHEL 9.4'),
    } as BareMetalInstanceCatalogItemFields,
  }),
];

export const mockBareMetalInstanceCatalogItemsListResponse =
  (): BareMetalInstanceCatalogItemsListResponse => {
    const items = mockBareMetalInstanceCatalogItems();
    return create(BareMetalInstanceCatalogItemsListResponseSchema, {
      size: items.length,
      total: items.length,
      items,
    });
  };

export const mockBareMetalInstanceCatalogItemsListResourceResult = (
  overrides: Parameters<
    typeof mockListResourceResult<BareMetalInstanceCatalogItemsListResponse>
  >[1] = {},
) => mockListResourceResult(mockBareMetalInstanceCatalogItemsListResponse(), overrides);
