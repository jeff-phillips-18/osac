import { useMemo } from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { ComputeInstanceCatalogItem } from '@osac/types';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import {
  diskImageGuestOsIconType,
  findDiskImageForReference,
} from './bareMetalCatalogItemResourceDisplay';
import CatalogFieldEditabilityLabel from './CatalogFieldEditabilityLabel';
import {
  catalogFieldPolicyBehavior,
  catalogFieldPolicyIsConfigured,
} from './catalogFieldPolicyDisplay';
import type { CatalogItemResourceLookups } from './catalogItemResourceLookups';
import {
  computeCatalogItemFields,
  computeDiskImageReferenceFromPolicy,
  computeInstanceTypeReferenceFromPolicy,
  findComputeInstanceTypeForReference,
  formatComputeCatalogDiskImage,
  formatComputeCatalogInstanceType,
  formatComputeCatalogMemory,
  formatComputeCatalogStorage,
  formatComputeCatalogVCpu,
  int32ValueFromPolicy,
} from './computeCatalogItemResourceDisplay';
import { GuestOsIcon } from '../shared/GuestOsIcon';

import './CatalogItemResources.css';

interface ComputeCatalogItemResourcesProps {
  catalogItem: ComputeInstanceCatalogItem;
  resourceLookups: CatalogItemResourceLookups;
}

const ComputeCatalogItemResources = ({
  catalogItem,
  resourceLookups,
}: ComputeCatalogItemResourcesProps) => {
  const { t } = useTranslation();
  const fields = computeCatalogItemFields(catalogItem);
  const instanceTypeReference = computeInstanceTypeReferenceFromPolicy(fields?.instanceType);
  const diskImageReference = computeDiskImageReferenceFromPolicy(fields?.diskImage);
  const instanceTypePolicyBehavior = catalogFieldPolicyBehavior(fields?.instanceType);
  const bootDiskSizePolicyBehavior = catalogFieldPolicyBehavior(fields?.bootDisk?.sizeGib);
  const diskImagePolicyBehavior = catalogFieldPolicyBehavior(fields?.diskImage);
  const showInstanceTypeHardware = catalogFieldPolicyIsConfigured(fields?.instanceType);
  const bootDiskSizeGib = int32ValueFromPolicy(fields?.bootDisk?.sizeGib);

  const { computeInstanceTypes, diskImages } = resourceLookups;

  const instanceType = useMemo(
    () => findComputeInstanceTypeForReference(computeInstanceTypes, instanceTypeReference),
    [instanceTypeReference, computeInstanceTypes],
  );

  const diskImage = useMemo(
    () => findDiskImageForReference(diskImages, diskImageReference),
    [diskImageReference, diskImages],
  );

  const diskImageOsIcon = diskImageGuestOsIconType(diskImage);

  const instanceTypeLabel = formatComputeCatalogInstanceType(
    fields,
    instanceType,
    instanceTypeReference,
  );
  const vCpuLabel = formatComputeCatalogVCpu(fields, instanceType, t);
  const memoryLabel = formatComputeCatalogMemory(fields, instanceType, t);
  const storageLabel = formatComputeCatalogStorage(fields, bootDiskSizeGib, t);
  const diskImageLabel = formatComputeCatalogDiskImage(fields, diskImage, diskImageReference);

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Instance type')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }}>
                <FlexItem>{instanceTypeLabel || '-'}</FlexItem>
                <FlexItem>
                  <CatalogFieldEditabilityLabel behavior={instanceTypePolicyBehavior} />
                </FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      {showInstanceTypeHardware ? (
        <StackItem className="catalog-item-resources__hardware">
          <DescriptionList isHorizontal isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('vCPU')}</DescriptionListTerm>
              <DescriptionListDescription>{vCpuLabel || '-'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Memory')}</DescriptionListTerm>
              <DescriptionListDescription>{memoryLabel || '-'}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </StackItem>
      ) : null}
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Storage')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }}>
                <FlexItem>{storageLabel || '-'}</FlexItem>
                <FlexItem>
                  <CatalogFieldEditabilityLabel behavior={bootDiskSizePolicyBehavior} />
                </FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Disk image')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex
                flexWrap={{ default: 'nowrap' }}
                gap={{ default: 'gapXs' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                {diskImageOsIcon ? (
                  <FlexItem>
                    <GuestOsIcon os={diskImageOsIcon} size="sm" />
                  </FlexItem>
                ) : null}
                <FlexItem>{diskImageLabel || '-'}</FlexItem>
                <FlexItem>
                  <CatalogFieldEditabilityLabel behavior={diskImagePolicyBehavior} />
                </FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

export default ComputeCatalogItemResources;
