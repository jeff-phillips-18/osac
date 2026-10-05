import { create } from '@bufbuild/protobuf';

import {
  ComputeInstanceCatalogItem,
  type ComputeInstanceCatalogItemFields,
  ComputeInstanceCatalogItemSchema,
  type ComputeInstanceCatalogItemsListResponse,
  ComputeInstanceCatalogItemsListResponseSchema,
  InstanceTypeReferenceSchema,
} from '@osac/types';

import {
  MOCK_CATALOG_PROJECT,
  MOCK_COMPUTE_INSTANCE_TYPE_IDS,
  MOCK_DISK_IMAGE_IDS,
  mockCatalogMetadata,
  mockDiskImageReference,
  mockListResourceResult,
} from './shared';

const mockComputeInstanceTypeReference = (id: string, name: string) =>
  create(InstanceTypeReferenceSchema, {
    id,
    name,
    project: MOCK_CATALOG_PROJECT,
    shared: false,
  });

const lockedComputeInstanceTypePolicy = (id: string, name: string) => ({
  behavior: {
    case: 'locked' as const,
    value: mockComputeInstanceTypeReference(id, name),
  },
});

const editableComputeInstanceTypePolicy = (id: string, name: string) => ({
  behavior: {
    case: 'editable' as const,
    value: {
      defaultValue: mockComputeInstanceTypeReference(id, name),
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

const lockedBootDiskSizePolicy = (sizeGib: number) => ({
  sizeGib: {
    behavior: {
      case: 'locked' as const,
      value: sizeGib,
    },
  },
});

const editableBootDiskSizePolicy = (sizeGib: number) => ({
  sizeGib: {
    behavior: {
      case: 'editable' as const,
      value: {
        defaultValue: sizeGib,
      },
    },
  },
});

const mockComputeCatalogItem = (
  id: string,
  name: string,
  options: {
    title: string;
    description: string;
    published?: boolean;
    fields?: ComputeInstanceCatalogItemFields;
  },
): ComputeInstanceCatalogItem =>
  create(ComputeInstanceCatalogItemSchema, {
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
 * Five compute catalog items covering `ComputeCatalogItemResources` UI variants:
 *
 * 1. Locked instance type + editable disk image + locked boot disk (nested vCPU/memory).
 * 2. Editable instance type + locked disk image + editable boot disk.
 * 3. Locked instance type, disk image, and boot disk (all Locked badges).
 * 4. No instance type policy (no nested block; storage and disk image only).
 * 5. Unpublished item with locked instance type, disk image, and boot disk.
 */
export const mockComputeInstanceCatalogItems = (): ComputeInstanceCatalogItem[] => [
  mockComputeCatalogItem('vm-catalog-rhel-standard', 'vm-catalog-rhel-standard', {
    title: 'RHEL 9 standard VM',
    description:
      'Locked instance type with nested vCPU/memory, editable disk image, locked 40 GiB boot disk.',
    fields: {
      instanceType: lockedComputeInstanceTypePolicy(
        MOCK_COMPUTE_INSTANCE_TYPE_IDS.standard48,
        'standard-4-8',
      ),
      diskImage: editableDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel94, 'RHEL 9.4'),
      bootDisk: lockedBootDiskSizePolicy(40),
    } as ComputeInstanceCatalogItemFields,
  }),
  mockComputeCatalogItem('vm-catalog-flexible', 'vm-catalog-flexible', {
    title: 'Flexible Linux VM',
    description: 'Editable instance type and boot disk; locked RHEL 10 disk image.',
    fields: {
      instanceType: editableComputeInstanceTypePolicy(
        MOCK_COMPUTE_INSTANCE_TYPE_IDS.standard416,
        'standard-4-16',
      ),
      diskImage: lockedDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel10, 'RHEL 10'),
      bootDisk: editableBootDiskSizePolicy(80),
    } as ComputeInstanceCatalogItemFields,
  }),
  mockComputeCatalogItem('vm-catalog-all-locked', 'vm-catalog-all-locked', {
    title: 'Fixed-size Linux VM',
    description: 'Locked instance type, disk image, and 100 GiB boot disk.',
    fields: {
      instanceType: lockedComputeInstanceTypePolicy(
        MOCK_COMPUTE_INSTANCE_TYPE_IDS.standard416,
        'standard-4-16',
      ),
      diskImage: lockedDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel96, 'RHEL 9.6'),
      bootDisk: lockedBootDiskSizePolicy(100),
    } as ComputeInstanceCatalogItemFields,
  }),
  mockComputeCatalogItem('vm-catalog-storage-only', 'vm-catalog-storage-only', {
    title: 'Boot disk and image only',
    description: 'No instance type policy — nested vCPU/memory section hidden.',
    fields: {
      diskImage: editableDiskImagePolicy(MOCK_DISK_IMAGE_IDS.centos, 'CentOS Stream 9'),
      bootDisk: editableBootDiskSizePolicy(50),
    } as ComputeInstanceCatalogItemFields,
  }),
  mockComputeCatalogItem('vm-catalog-draft', 'vm-catalog-draft', {
    title: 'Draft VM offering',
    description: 'Unpublished compute catalog item with locked instance type, disk, and boot disk.',
    published: false,
    fields: {
      instanceType: lockedComputeInstanceTypePolicy(
        MOCK_COMPUTE_INSTANCE_TYPE_IDS.standard48,
        'standard-4-8',
      ),
      diskImage: lockedDiskImagePolicy(MOCK_DISK_IMAGE_IDS.rhel94, 'RHEL 9.4'),
      bootDisk: lockedBootDiskSizePolicy(40),
    } as ComputeInstanceCatalogItemFields,
  }),
];

export const mockComputeInstanceCatalogItemsListResponse =
  (): ComputeInstanceCatalogItemsListResponse => {
    const items = mockComputeInstanceCatalogItems();
    return create(ComputeInstanceCatalogItemsListResponseSchema, {
      size: items.length,
      total: items.length,
      items,
    });
  };

export const mockComputeInstanceCatalogItemsListResourceResult = (
  overrides: Parameters<
    typeof mockListResourceResult<ComputeInstanceCatalogItemsListResponse>
  >[1] = {},
) => mockListResourceResult(mockComputeInstanceCatalogItemsListResponse(), overrides);
