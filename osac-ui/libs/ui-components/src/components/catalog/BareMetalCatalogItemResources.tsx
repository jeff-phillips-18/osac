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

import { BareMetalInstanceCatalogItem } from '@osac/types';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import {
  bareMetalCatalogItemFields,
  bareMetalDiskImageReferenceFromPolicy,
  bareMetalInstanceTypeReferenceFromPolicy,
  diskImageGuestOsIconType,
  findBareMetalInstanceTypeForReference,
  findDiskImageForReference,
  formatBareMetalCatalogCpu,
  formatBareMetalCatalogDiskImage,
  formatBareMetalCatalogGpu,
  formatBareMetalCatalogInstanceType,
  formatBareMetalCatalogRam,
} from './bareMetalCatalogItemResourceDisplay';
import CatalogFieldEditabilityLabel from './CatalogFieldEditabilityLabel';
import {
  catalogFieldPolicyBehavior,
  catalogFieldPolicyIsConfigured,
} from './catalogFieldPolicyDisplay';
import type { CatalogItemResourceLookups } from './catalogItemResourceLookups';
import { GuestOsIcon } from '../shared/GuestOsIcon';

import './CatalogItemResources.css';

interface BareMetalCatalogItemResourcesProps {
  catalogItem: BareMetalInstanceCatalogItem;
  resourceLookups: CatalogItemResourceLookups;
}

const BareMetalCatalogItemResources = ({
  catalogItem,
  resourceLookups,
}: BareMetalCatalogItemResourcesProps) => {
  const { t } = useTranslation();
  const fields = bareMetalCatalogItemFields(catalogItem);
  const instanceTypeReference = bareMetalInstanceTypeReferenceFromPolicy(fields?.instanceType);
  const diskImageReference = bareMetalDiskImageReferenceFromPolicy(fields?.diskImage);
  const instanceTypePolicyBehavior = catalogFieldPolicyBehavior(fields?.instanceType);
  const diskImagePolicyBehavior = catalogFieldPolicyBehavior(fields?.diskImage);
  const showInstanceTypeHardware = catalogFieldPolicyIsConfigured(fields?.instanceType);

  const { bareMetalInstanceTypes, diskImages } = resourceLookups;

  const instanceType = useMemo(
    () => findBareMetalInstanceTypeForReference(bareMetalInstanceTypes, instanceTypeReference),
    [instanceTypeReference, bareMetalInstanceTypes],
  );

  const diskImage = useMemo(
    () => findDiskImageForReference(diskImages, diskImageReference),
    [diskImageReference, diskImages],
  );

  const instanceTypeLabel = formatBareMetalCatalogInstanceType(
    fields,
    instanceType,
    instanceTypeReference,
  );
  const cpuLabel = formatBareMetalCatalogCpu(fields, instanceType, t);
  const ramLabel = formatBareMetalCatalogRam(fields, instanceType, t);
  const gpuLabel = formatBareMetalCatalogGpu(fields, instanceType, t);
  const diskImageLabel = formatBareMetalCatalogDiskImage(fields, diskImage, diskImageReference);
  const diskImageOsIcon = diskImageGuestOsIconType(diskImage);

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
              <DescriptionListTerm>{t('CPU')}</DescriptionListTerm>
              <DescriptionListDescription>{cpuLabel || '-'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('RAM')}</DescriptionListTerm>
              <DescriptionListDescription>{ramLabel || '-'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('GPU')}</DescriptionListTerm>
              <DescriptionListDescription>{gpuLabel || '-'}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </StackItem>
      ) : null}
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('OS image')}</DescriptionListTerm>
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

export default BareMetalCatalogItemResources;
