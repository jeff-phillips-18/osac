import { useMemo } from 'react';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { BareMetalInstance } from '@osac/types';
import { BareMetalTableRow } from '@osac/ui-components/components/BareMetalInstance/ListPage/BareMetalTableRow';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

interface BareMetalTableProps {
  instances: BareMetalInstance[];
  sshHostsByInstanceId?: ReadonlyMap<string, string>;
}

export const BareMetalTable = ({ instances, sshHostsByInstanceId }: BareMetalTableProps) => {
  const { t } = useTranslation();
  const columnLabels = useMemo(
    () => ({
      name: t('Name'),
      status: t('Status'),
      project: t('Project'),
      instanceType: t('Instance type'),
      diskImage: t('Disk image'),
      created: t('Created'),
      actions: t('Actions'),
    }),
    [t],
  );

  return (
    <Table aria-label={t('Bare metal instances')} variant="compact" borders>
      <Thead>
        <Tr>
          <Th>{columnLabels.name}</Th>
          <Th>{columnLabels.status}</Th>
          <Th>{columnLabels.project}</Th>
          <Th>{columnLabels.instanceType}</Th>
          <Th>{columnLabels.diskImage}</Th>
          <Th>{columnLabels.created}</Th>
          <Th aria-label={columnLabels.actions} />
        </Tr>
      </Thead>
      <Tbody>
        {instances.map((instance) => (
          <BareMetalTableRow
            key={instance.id}
            instance={instance}
            columnLabels={columnLabels}
            sshHost={sshHostsByInstanceId?.get(instance.id)}
          />
        ))}
      </Tbody>
    </Table>
  );
};
