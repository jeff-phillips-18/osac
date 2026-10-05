import type {
  BareMetalInstanceType,
  ClusterVersion,
  DiskImage,
  HostType,
  InstanceType,
} from '@osac/types';

export interface CatalogItemResourceLookups {
  diskImages: DiskImage[];
  computeInstanceTypes: InstanceType[];
  bareMetalInstanceTypes: BareMetalInstanceType[];
  clusterVersions: ClusterVersion[];
  hostTypes: HostType[];
}
