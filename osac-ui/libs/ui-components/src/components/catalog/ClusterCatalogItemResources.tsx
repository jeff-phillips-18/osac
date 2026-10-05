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

import { ClusterCatalogItem } from '@osac/types';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import CatalogFieldEditabilityLabel from './CatalogFieldEditabilityLabel';
import {
  catalogFieldPolicyBehavior,
  catalogFieldPolicyIsConfigured,
} from './catalogFieldPolicyDisplay';
import type { CatalogItemResourceLookups } from './catalogItemResourceLookups';
import {
  clusterCatalogItemFields,
  clusterCatalogNodeSetEntries,
  clusterNodeSetItemsFromPolicy,
  clusterNodeSetMapPolicy,
  clusterVersionReference,
  findClusterVersionForReference,
  findHostTypeForReference,
  formatClusterCatalogNodeSetDetail,
  formatClusterCatalogVersionRow,
} from './clusterCatalogItemResourceDisplay';
import { GuestOsIcon } from '../shared/GuestOsIcon';

import './CatalogItemResources.css';

interface ClusterCatalogItemResourcesProps {
  catalogItem: ClusterCatalogItem;
  resourceLookups: CatalogItemResourceLookups;
}

const ClusterCatalogItemResources = ({
  catalogItem,
  resourceLookups,
}: ClusterCatalogItemResourcesProps) => {
  const { t } = useTranslation();
  const fields = clusterCatalogItemFields(catalogItem);
  const versionReference = clusterVersionReference(fields);
  const nodeSetsPolicy = clusterNodeSetMapPolicy(fields);
  const nodeSetItems = clusterNodeSetItemsFromPolicy(nodeSetsPolicy);
  const nodeSetEntries = clusterCatalogNodeSetEntries(nodeSetItems);
  const versionPolicyBehavior = catalogFieldPolicyBehavior(fields?.version);
  const nodeSetsPolicyBehavior = catalogFieldPolicyBehavior(nodeSetsPolicy);
  const showNodeSets = catalogFieldPolicyIsConfigured(nodeSetsPolicy);

  const { clusterVersions, hostTypes } = resourceLookups;

  const clusterVersion = useMemo(
    () => findClusterVersionForReference(clusterVersions, versionReference),
    [clusterVersions, versionReference],
  );

  const nodeSetRows = useMemo(
    () =>
      nodeSetEntries.map(({ key, nodeSet }) => ({
        key,
        detail: formatClusterCatalogNodeSetDetail(
          nodeSet,
          findHostTypeForReference(hostTypes, nodeSet.hostType),
          t,
        ),
      })),
    [hostTypes, nodeSetEntries, t],
  );

  const versionLabel = formatClusterCatalogVersionRow(fields, clusterVersion, versionReference);
  const showClusterVersionIcon = Boolean(versionReference || clusterVersion);

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Cluster version')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex
                flexWrap={{ default: 'nowrap' }}
                gap={{ default: 'gapXs' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                {showClusterVersionIcon ? (
                  <FlexItem>
                    <GuestOsIcon os="rhel" size="sm" />
                  </FlexItem>
                ) : null}
                <FlexItem>{versionLabel || '-'}</FlexItem>
                <FlexItem>
                  <CatalogFieldEditabilityLabel behavior={versionPolicyBehavior} />
                </FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      {showNodeSets ? (
        <>
          <StackItem>
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Node sets')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <CatalogFieldEditabilityLabel behavior={nodeSetsPolicyBehavior} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </StackItem>
          {nodeSetRows.length > 0 ? (
            <StackItem className="catalog-item-resources__hardware">
              <DescriptionList isHorizontal isCompact>
                {nodeSetRows.map(({ key, detail }) => (
                  <DescriptionListGroup key={key}>
                    <DescriptionListTerm>{key}</DescriptionListTerm>
                    <DescriptionListDescription>{detail}</DescriptionListDescription>
                  </DescriptionListGroup>
                ))}
              </DescriptionList>
            </StackItem>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
};

export default ClusterCatalogItemResources;
