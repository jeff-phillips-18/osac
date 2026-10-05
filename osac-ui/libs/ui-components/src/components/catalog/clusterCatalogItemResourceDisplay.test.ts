import { create } from '@bufbuild/protobuf';
import type { TFunction } from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  ClusterTemplateNodeSetSchema,
  ClusterVersionReferenceSchema,
  HostTypeReferenceSchema,
  HostTypeSchema,
} from '@osac/types';

import {
  clusterCatalogNodeSetEntries,
  formatClusterCatalogNodeSetDetail,
  formatClusterCatalogVersionLabel,
  primaryClusterCatalogNodeSet,
} from './clusterCatalogItemResourceDisplay';
import { initTestI18n } from '../../test-utils/i18n';

describe('clusterCatalogItemResourceDisplay', () => {
  let t: TFunction;

  beforeAll(async () => {
    const i18n = await initTestI18n();
    t = i18n.t.bind(i18n);
  });

  it('sorts node set entries by key', () => {
    const items = {
      workers: create(ClusterTemplateNodeSetSchema, { size: 5 }),
      'control-plane': create(ClusterTemplateNodeSetSchema, { size: 3 }),
    };

    expect(clusterCatalogNodeSetEntries(items).map((entry) => entry.key)).toEqual([
      'control-plane',
      'workers',
    ]);
  });

  it('formats node set detail as host type and node count', () => {
    const nodeSet = create(ClusterTemplateNodeSetSchema, {
      size: 3,
      hostType: create(HostTypeReferenceSchema, { name: 'bm-cpu-64c' }),
    });
    const hostType = create(HostTypeSchema, {
      id: 'ht-1',
      metadata: { name: 'bm-cpu-64c' },
      title: 'BM CPU 64c',
      description: '',
      interfaces: [],
    });

    expect(formatClusterCatalogNodeSetDetail(nodeSet, hostType, t)).toBe('bm-cpu-64c · 3 nodes');
  });

  it('prefixes bare version strings with OpenShift', () => {
    expect(
      formatClusterCatalogVersionLabel(
        undefined,
        create(ClusterVersionReferenceSchema, { name: '4.19.0' }),
      ),
    ).toBe('OpenShift 4.19.0');
    expect(
      formatClusterCatalogVersionLabel(
        undefined,
        create(ClusterVersionReferenceSchema, { name: 'OpenShift 4.19' }),
      ),
    ).toBe('OpenShift 4.19');
  });

  it('selects the lexicographically first node set as primary', () => {
    const items = {
      workers: create(ClusterTemplateNodeSetSchema, { size: 5 }),
      'control-plane': create(ClusterTemplateNodeSetSchema, { size: 3 }),
    };

    expect(primaryClusterCatalogNodeSet(items)?.key).toBe('control-plane');
  });
});
