import {
  BareMetalInstanceCatalogItem,
  BareMetalInstanceCatalogItems,
  ClusterCatalogItem,
  ClusterCatalogItems,
  ComputeInstanceCatalogItem,
  ComputeInstanceCatalogItems,
  ServiceTier,
} from '@osac/types';
import { useListResource } from '@osac/ui-components/api/use-resource';
import {
  CatalogListFilterCriteria,
  buildCatalogListFilter,
} from '@osac/ui-components/api/v1/catalog-item-list-filter';
import {
  MOCK_CATALOG_DATA,
  mockBareMetalInstanceCatalogItemsListResourceResult,
  mockClusterCatalogItemsListResourceResult,
  mockComputeInstanceCatalogItemsListResourceResult,
} from '@osac/ui-components/components/catalog/mock-data';
import { useSession } from '@osac/ui-components/hooks/use-session';

const mockComputeResults = MOCK_CATALOG_DATA
  ? mockComputeInstanceCatalogItemsListResourceResult()
  : undefined;
const mockClusterResults = MOCK_CATALOG_DATA
  ? mockClusterCatalogItemsListResourceResult()
  : undefined;
const mockBareMetalResults = MOCK_CATALOG_DATA
  ? mockBareMetalInstanceCatalogItemsListResourceResult()
  : undefined;

export const useCatalogItems = (
  filterCriteria: CatalogListFilterCriteria,
  typeFilter: readonly ServiceTier[],
  fetchAllTypes: boolean,
): {
  error: unknown;
  isLoading: boolean;
  hasSuccessfulQuery: boolean;
  vms: ComputeInstanceCatalogItem[];
  clusters: ClusterCatalogItem[];
  bms: BareMetalInstanceCatalogItem[];
  typeCounts: Record<ServiceTier, number>;
  unfilteredTotalItems: number;
} => {
  const { enabledServices } = useSession();
  const listFilter = buildCatalogListFilter(filterCriteria);
  const listParams = listFilter ? { filter: listFilter } : {};

  const shouldFetchKind = (kind: ServiceTier) =>
    enabledServices.includes(kind) && (fetchAllTypes || typeFilter.includes(kind));

  const vmsQueryData = useListResource(ComputeInstanceCatalogItems, listParams, {
    enabled: shouldFetchKind(ServiceTier.VMAAS) && !MOCK_CATALOG_DATA,
  });
  const clustersQueryData = useListResource(ClusterCatalogItems, listParams, {
    enabled: shouldFetchKind(ServiceTier.CAAS) && !MOCK_CATALOG_DATA,
  });
  const bmsQueryData = useListResource(BareMetalInstanceCatalogItems, listParams, {
    enabled: shouldFetchKind(ServiceTier.BMAAS) && !MOCK_CATALOG_DATA,
  });

  const vmsQuery = MOCK_CATALOG_DATA ? mockComputeResults : vmsQueryData;
  const clustersQuery = MOCK_CATALOG_DATA ? mockClusterResults : clustersQueryData;
  const bmsQuery = MOCK_CATALOG_DATA ? mockBareMetalResults : bmsQueryData;

  const vmsTotalQuery = useListResource(
    ComputeInstanceCatalogItems,
    { limit: 0 },
    { enabled: enabledServices.includes(ServiceTier.VMAAS) && !MOCK_CATALOG_DATA },
  );
  const clustersTotalQuery = useListResource(
    ClusterCatalogItems,
    { limit: 0 },
    { enabled: enabledServices.includes(ServiceTier.CAAS) && !MOCK_CATALOG_DATA },
  );
  const bmsTotalQuery = useListResource(
    BareMetalInstanceCatalogItems,
    { limit: 0 },
    { enabled: enabledServices.includes(ServiceTier.BMAAS) && !MOCK_CATALOG_DATA },
  );

  const mockVmTotal = mockComputeResults?.data?.total ?? 0;
  const mockClusterTotal = mockClusterResults?.data?.total ?? 0;
  const mockBmTotal = mockBareMetalResults?.data?.total ?? 0;

  const isLoading =
    vmsQuery?.isLoading ||
    clustersQuery?.isLoading ||
    bmsQuery?.isLoading ||
    vmsTotalQuery.isLoading ||
    clustersTotalQuery.isLoading ||
    bmsTotalQuery.isLoading;

  const error =
    vmsQuery?.error ||
    clustersQuery?.error ||
    bmsQuery?.error ||
    vmsTotalQuery.error ||
    clustersTotalQuery.error ||
    bmsTotalQuery.error;

  const hasSuccessfulQuery = [vmsQuery, clustersQuery, bmsQuery].some(
    (query) => !query?.isLoading && !query?.error,
  );

  const totalVmsCount = MOCK_CATALOG_DATA ? mockVmTotal : (vmsTotalQuery.data?.total ?? 0);
  const totalBmsCount = MOCK_CATALOG_DATA ? mockBmTotal : (bmsTotalQuery.data?.total ?? 0);
  const totalClustersCount = MOCK_CATALOG_DATA
    ? mockClusterTotal
    : (clustersTotalQuery.data?.total ?? 0);

  return {
    error,
    isLoading,
    hasSuccessfulQuery,
    vms: shouldFetchKind(ServiceTier.VMAAS) ? (vmsQuery?.data?.items ?? []) : [],
    clusters: shouldFetchKind(ServiceTier.CAAS) ? (clustersQuery?.data?.items ?? []) : [],
    bms: shouldFetchKind(ServiceTier.BMAAS) ? (bmsQuery?.data?.items ?? []) : [],
    typeCounts: {
      [ServiceTier.VMAAS]: totalVmsCount,
      [ServiceTier.CAAS]: totalClustersCount,
      [ServiceTier.BMAAS]: totalBmsCount,
      [ServiceTier.UNSPECIFIED]: 0,
      [ServiceTier.MAAS]: 0,
    },
    unfilteredTotalItems: totalVmsCount + totalClustersCount + totalBmsCount,
  };
};
