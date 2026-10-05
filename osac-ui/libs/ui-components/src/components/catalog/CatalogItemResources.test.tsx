import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CatalogItemResources from './CatalogItemResources';
import {
  mockBareMetalInstanceCatalogItems,
  mockCatalogItemResourceLookups,
  mockClusterCatalogItems,
  mockComputeInstanceCatalogItems,
} from './mock-data';
import { renderWithProviders } from '../../test-utils/TestProviders';

const resourceLookups = mockCatalogItemResourceLookups();

const findMockItem = <T extends { metadata?: { name?: string } }>(items: T[], name: string): T => {
  const item = items.find((entry) => entry.metadata?.name === name);
  if (!item) {
    throw new Error(`Expected mock catalog item "${name}"`);
  }
  return item;
};

describe('CatalogItemResources', () => {
  describe('compute catalog items', () => {
    it('shows resolved instance type hardware, storage, and disk image with editability badges', () => {
      const catalogItem = findMockItem(
        mockComputeInstanceCatalogItems(),
        'vm-catalog-rhel-standard',
      );

      renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      expect(screen.getByText('Standard 4 vCPU / 8 GiB')).toBeInTheDocument();
      expect(screen.getByText('4 vCPU')).toBeInTheDocument();
      expect(screen.getByText('8 GiB')).toBeInTheDocument();
      expect(screen.getByText('40 GiB')).toBeInTheDocument();
      expect(screen.getByText('RHEL 9.4')).toBeInTheDocument();
      expect(screen.getAllByText('Locked').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Editable')).toBeInTheDocument();
    });

    it('hides nested vCPU and memory when instance type is not configured', () => {
      const catalogItem = findMockItem(
        mockComputeInstanceCatalogItems(),
        'vm-catalog-storage-only',
      );

      renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      expect(screen.queryByText('Memory')).not.toBeInTheDocument();
      expect(screen.getByText('50 GiB')).toBeInTheDocument();
      expect(screen.getByText('CentOS Stream 9')).toBeInTheDocument();
    });
  });

  describe('bare metal catalog items', () => {
    it('shows CPU, RAM, and GPU details for a locked GPU instance type', () => {
      const catalogItem = findMockItem(mockBareMetalInstanceCatalogItems(), 'bm-catalog-gpu-large');

      renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      expect(screen.getByText('Large')).toBeInTheDocument();
      expect(screen.getByText('64 vCPU')).toBeInTheDocument();
      expect(screen.getByText('512 GB')).toBeInTheDocument();
      expect(screen.getByText('NVIDIA A100 80 GB')).toBeInTheDocument();
      expect(screen.getByText('RHEL 9.4')).toBeInTheDocument();
    });

    it('shows a dash for GPU when the instance type has no accelerators', () => {
      const catalogItem = findMockItem(mockBareMetalInstanceCatalogItems(), 'bm-catalog-compute');

      const { container } = renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      const gpuGroup = within(container)
        .getByText('GPU')
        .closest('.pf-v6-c-description-list__group');
      expect(gpuGroup).toBeTruthy();
      expect(within(gpuGroup as HTMLElement).getByText('-')).toBeInTheDocument();
    });

    it('hides the hardware block when instance type is not configured', () => {
      const catalogItem = findMockItem(mockBareMetalInstanceCatalogItems(), 'bm-catalog-os-only');

      renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      expect(screen.queryByText('CPU')).not.toBeInTheDocument();
      expect(screen.queryByText('RAM')).not.toBeInTheDocument();
      expect(screen.getByText('RHEL 9.4')).toBeInTheDocument();
    });
  });

  describe('cluster catalog items', () => {
    it('shows cluster version and sorted node set details', () => {
      const catalogItem = findMockItem(mockClusterCatalogItems(), 'cluster-catalog-openshift-419');

      renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      expect(screen.getByText('OpenShift 4.19.0')).toBeInTheDocument();
      expect(screen.getByText('control-plane')).toBeInTheDocument();
      expect(screen.getByText('bm-cpu-64c · 3 nodes')).toBeInTheDocument();
      expect(screen.getByText('workers')).toBeInTheDocument();
      expect(screen.getByText('bm-cpu-32c · 5 nodes')).toBeInTheDocument();
      expect(screen.getByText('gpu-workers')).toBeInTheDocument();
      expect(screen.getByText('bm-gpu-h100 · 2 nodes')).toBeInTheDocument();
    });

    it('omits node sets when the node set policy is not configured', () => {
      const catalogItem = findMockItem(mockClusterCatalogItems(), 'cluster-catalog-version-only');

      renderWithProviders(
        <CatalogItemResources catalogItem={catalogItem} resourceLookups={resourceLookups} />,
      );

      expect(screen.getByText('OpenShift 4.17.0')).toBeInTheDocument();
      expect(screen.queryByText('Node sets')).not.toBeInTheDocument();
    });
  });
});
