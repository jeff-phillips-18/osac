import { FC } from 'react';
import { Td, Tr } from '@patternfly/react-table';

import { BareMetalInstance } from '@osac/types';
import { formatBareMetalCreatedAt } from '@osac/ui-components/components/BareMetalInstance/bareMetalInstanceDisplay';
import ResourceNameField from '@osac/ui-components/components/Resource/ResourceNameField';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { BareMetalActionsMenu } from './BareMetalActionsMenu';
import { BareMetalStatusLabel } from '../BareMetalStatusLabel';

export type BareMetalTableColumn =
  | 'name'
  | 'status'
  | 'project'
  | 'instanceType'
  | 'diskImage'
  | 'created'
  | 'actions';

interface BareMetalTableRowProps {
  instance: BareMetalInstance;
  columnLabels: Record<BareMetalTableColumn, string>;
  sshHost?: string;
}

export const BareMetalTableRow: FC<BareMetalTableRowProps> = ({
  instance,
  columnLabels,
  sshHost,
}) => {
  const { t } = useTranslation();

  const instanceTypeReference = instance.spec?.instanceType;
  const instanceTypeLabel = instanceTypeReference?.name || instanceTypeReference?.id || '—';

  const diskImageReference = instance.spec?.diskImage;
  const diskImageLabel = diskImageReference?.name || diskImageReference?.id || '—';

  return (
    <Tr key={instance.id}>
      <Td dataLabel={columnLabels.name}>
        <ResourceNameField
          resource={instance}
          detailsUrl={`/bare-metal/${instance.id}`}
          subTitle={instance.spec?.catalogItem?.name}
        />
      </Td>
      <Td dataLabel={columnLabels.status}>
        <BareMetalStatusLabel state={instance.status?.state} />
      </Td>
      <Td dataLabel={columnLabels.project}>{instance.metadata?.project || t('Default')}</Td>
      <Td dataLabel={columnLabels.instanceType}>{instanceTypeLabel}</Td>
      <Td dataLabel={columnLabels.diskImage}>{diskImageLabel}</Td>
      <Td dataLabel={columnLabels.created}>{formatBareMetalCreatedAt(instance.metadata)}</Td>
      <Td dataLabel={columnLabels.actions} isActionCell>
        <BareMetalActionsMenu instance={instance} sshHost={sshHost} />
      </Td>
    </Tr>
  );
};
