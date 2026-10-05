import { create } from '@bufbuild/protobuf';

import {
  ClusterCatalogItem,
  type ClusterCatalogItemFields,
  ClusterCatalogItemSchema,
  type ClusterCatalogItemsListResponse,
  ClusterCatalogItemsListResponseSchema,
  ClusterTemplateNodeSetSchema,
  ClusterVersionReferenceSchema,
  HostTypeReferenceSchema,
} from '@osac/types';

import {
  MOCK_CATALOG_PROJECT,
  MOCK_CLUSTER_VERSION_IDS,
  MOCK_HOST_TYPE_IDS,
  mockCatalogMetadata,
  mockListResourceResult,
} from './shared';

const mockClusterVersionReference = (id: string, name: string) =>
  create(ClusterVersionReferenceSchema, {
    id,
    name,
    project: MOCK_CATALOG_PROJECT,
    shared: false,
  });

const mockHostTypeReference = (id: string, name: string) =>
  create(HostTypeReferenceSchema, {
    id,
    name,
    project: MOCK_CATALOG_PROJECT,
    shared: false,
  });

const lockedClusterVersionPolicy = (id: string, name: string) => ({
  behavior: {
    case: 'locked' as const,
    value: mockClusterVersionReference(id, name),
  },
});

const editableClusterVersionPolicy = (id: string, name: string) => ({
  behavior: {
    case: 'editable' as const,
    value: {
      defaultValue: mockClusterVersionReference(id, name),
    },
  },
});

type NodeSetSpec = {
  hostTypeId: string;
  hostTypeName: string;
  size: number;
};

const nodeSetMapFromSpecs = (specs: Record<string, NodeSetSpec>) =>
  Object.fromEntries(
    Object.entries(specs).map(([key, spec]) => [
      key,
      create(ClusterTemplateNodeSetSchema, {
        hostType: mockHostTypeReference(spec.hostTypeId, spec.hostTypeName),
        size: spec.size,
      }),
    ]),
  );

const lockedNodeSetsPolicy = (specs: Record<string, NodeSetSpec>) => ({
  behavior: {
    case: 'locked' as const,
    value: {
      items: nodeSetMapFromSpecs(specs),
    },
  },
});

const editableNodeSetsPolicy = (specs: Record<string, NodeSetSpec>) => ({
  behavior: {
    case: 'editable' as const,
    value: {
      defaultValue: {
        items: nodeSetMapFromSpecs(specs),
      },
    },
  },
});

const mockClusterCatalogItem = (
  id: string,
  name: string,
  options: {
    title: string;
    description: string;
    published?: boolean;
    fields?: ClusterCatalogItemFields;
  },
): ClusterCatalogItem =>
  create(ClusterCatalogItemSchema, {
    id,
    metadata: mockCatalogMetadata(name),
    title: options.title,
    description: options.description,
    template: { id: `tpl-${name}` },
    published: options.published ?? true,
    templateParameters: {},
    fields: options.fields,
  });

const multiNodeSetSpecs = {
  'control-plane': {
    hostTypeId: MOCK_HOST_TYPE_IDS.bmCpu64c,
    hostTypeName: 'bm-cpu-64c',
    size: 3,
  },
  workers: {
    hostTypeId: MOCK_HOST_TYPE_IDS.bmCpu32c,
    hostTypeName: 'bm-cpu-32c',
    size: 5,
  },
  'gpu-workers': {
    hostTypeId: MOCK_HOST_TYPE_IDS.bmGpuH100,
    hostTypeName: 'bm-gpu-h100',
    size: 2,
  },
} satisfies Record<string, NodeSetSpec>;

/**
 * Cluster catalog items covering `ClusterCatalogItemResources` UI variants:
 *
 * 1. Locked OpenShift 4.19 + editable multi node set map (matches design mock).
 * 2. Editable version + single locked worker node set.
 * 3. Version only (no node set policy).
 * 4. Unpublished item with locked version and node sets.
 */
export const mockClusterCatalogItems = (): ClusterCatalogItem[] => [
  mockClusterCatalogItem('cluster-catalog-openshift-419', 'cluster-catalog-openshift-419', {
    title: 'OpenShift 4.19 cluster',
    description: 'Locked cluster version with editable control plane, worker, and GPU node sets.',
    fields: {
      version: lockedClusterVersionPolicy(MOCK_CLUSTER_VERSION_IDS.oc419, '4-19-0'),
      nodeSets: editableNodeSetsPolicy(multiNodeSetSpecs),
    } as ClusterCatalogItemFields,
  }),
  mockClusterCatalogItem('cluster-catalog-flexible', 'cluster-catalog-flexible', {
    title: 'Flexible OpenShift cluster',
    description: 'Editable cluster version and a single worker node set.',
    fields: {
      version: editableClusterVersionPolicy(MOCK_CLUSTER_VERSION_IDS.oc416, '4-16-0'),
      nodeSets: lockedNodeSetsPolicy({
        workers: {
          hostTypeId: MOCK_HOST_TYPE_IDS.standard,
          hostTypeName: 'standard-worker',
          size: 3,
        },
      }),
    } as ClusterCatalogItemFields,
  }),
  mockClusterCatalogItem('cluster-catalog-version-only', 'cluster-catalog-version-only', {
    title: 'Version-only cluster',
    description: 'Cluster version policy without node sets.',
    fields: {
      version: lockedClusterVersionPolicy(MOCK_CLUSTER_VERSION_IDS.oc417, '4-17-0'),
    } as ClusterCatalogItemFields,
  }),
  mockClusterCatalogItem('cluster-catalog-draft', 'cluster-catalog-draft', {
    title: 'Draft cluster offering',
    description: 'Unpublished cluster catalog item.',
    published: false,
    fields: {
      version: lockedClusterVersionPolicy(MOCK_CLUSTER_VERSION_IDS.oc419, '4-19-0'),
      nodeSets: lockedNodeSetsPolicy({
        compute: {
          hostTypeId: MOCK_HOST_TYPE_IDS.bmCpu64c,
          hostTypeName: 'bm-cpu-64c',
          size: 3,
        },
      }),
    } as ClusterCatalogItemFields,
  }),
];

export const mockClusterCatalogItemsListResponse = (): ClusterCatalogItemsListResponse => {
  const items = mockClusterCatalogItems();
  return create(ClusterCatalogItemsListResponseSchema, {
    size: items.length,
    total: items.length,
    items,
  });
};

export const mockClusterCatalogItemsListResourceResult = (
  overrides: Parameters<typeof mockListResourceResult<ClusterCatalogItemsListResponse>>[1] = {},
) => mockListResourceResult(mockClusterCatalogItemsListResponse(), overrides);
