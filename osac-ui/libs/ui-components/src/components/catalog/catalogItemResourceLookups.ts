import { BareMetalInstanceTypes } from '@osac/types';
import { useListResource } from '@osac/ui-components/api/use-resource';
import { useClusterVersions } from '@osac/ui-components/api/v1/cluster-versions';
import { useDiskImages } from '@osac/ui-components/api/v1/disk-image';
import { useHostTypes } from '@osac/ui-components/api/v1/host-types';
import { useInstanceTypes } from '@osac/ui-components/api/v1/instance-types';

import type { CatalogItemResourceLookups } from './catalogItemResourceLookups.types';
import { mockCatalogItemResourceLookups } from './mock-data/mock-catalog-resource-lookups';
import { MOCK_CATALOG_DATA } from './mock-data/shared';

export type { CatalogItemResourceLookups } from './catalogItemResourceLookups.types';

type UseCatalogItemResourceLookupsOptions = {
  enabled?: boolean;
};

const mockResourceLookups = MOCK_CATALOG_DATA ? mockCatalogItemResourceLookups() : undefined;

export const useCatalogItemResourceLookups = (
  options: UseCatalogItemResourceLookupsOptions = {},
): CatalogItemResourceLookups => {
  const enabled = !MOCK_CATALOG_DATA && (options.enabled ?? true);

  const { data: diskImages = [] } = useDiskImages({}, { enabled });
  const { data: computeInstanceTypes = [] } = useInstanceTypes({}, { enabled });
  const { data: bareMetalInstanceTypesData } = useListResource(
    BareMetalInstanceTypes,
    {},
    { enabled },
  );
  const { data: clusterVersions = [] } = useClusterVersions({}, { enabled });
  const { data: hostTypes = [] } = useHostTypes({}, { enabled });

  if (mockResourceLookups) {
    return mockResourceLookups;
  }

  return {
    diskImages,
    computeInstanceTypes,
    bareMetalInstanceTypes: bareMetalInstanceTypesData?.items ?? [],
    clusterVersions,
    hostTypes,
  };
};
