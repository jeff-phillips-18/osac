import { useState } from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import { type BareMetalInstance, BareMetalInstanceState, BareMetalInstanceType } from '@osac/types';
import InstanceCard from '@osac/ui-components/components/InstanceCard/InstanceCard';
import ResourceNameField from '@osac/ui-components/components/Resource/ResourceNameField';
import { useSession } from '@osac/ui-components/hooks/use-session';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { BareMetalActionsMenu } from './BareMetalActionsMenu';
import BareMetalConnectSshModal from '../BareMetalConnectSshModal';
import { formatBareMetalCreatedAt } from '../bareMetalInstanceDisplay';
import { BareMetalStatusLabel } from '../BareMetalStatusLabel';

interface BareMetalInstanceCardProps {
  instance: BareMetalInstance;
  instanceTypes?: BareMetalInstanceType[];
  sshHost?: string;
}

const BareMetalInstanceCard = ({ instance, sshHost }: BareMetalInstanceCardProps) => {
  const { t } = useTranslation();
  const { username } = useSession();
  const [connectSshOpen, setConnectSshOpen] = useState(false);

  const instanceTypeReference = instance.spec?.instanceType;
  const instanceTypeLabel = instanceTypeReference?.name || instanceTypeReference?.id || '—';

  const diskImageReference = instance.spec?.diskImage;
  const diskImageLabel = diskImageReference?.name || diskImageReference?.id || '—';

  const canConnectSsh =
    instance.status?.state === BareMetalInstanceState.RUNNING && Boolean(sshHost);
  const createdAt = formatBareMetalCreatedAt(instance.metadata);

  return (
    <>
      {connectSshOpen && sshHost && (
        <BareMetalConnectSshModal
          host={sshHost}
          username={username}
          onClose={() => setConnectSshOpen(false)}
        />
      )}
      <InstanceCard
        kind="bm"
        statusLabel={<BareMetalStatusLabel state={instance.status?.state} />}
        actionMenu={<BareMetalActionsMenu instance={instance} sshHost={sshHost} />}
        title={
          <ResourceNameField
            resource={instance}
            detailsUrl={`/bare-metal/${instance.id}`}
            subTitle={instance.spec?.catalogItem?.name}
          />
        }
        body={
          <DescriptionList isHorizontal isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Instance type')}</DescriptionListTerm>
              <DescriptionListDescription>{instanceTypeLabel}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Disk image')}</DescriptionListTerm>
              <DescriptionListDescription>{diskImageLabel}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        }
        footer={
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Flex
                flexWrap={{ default: 'nowrap' }}
                gap={{ default: 'gapLg' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
              >
                <FlexItem>{t('Project')}</FlexItem>
                <FlexItem>{instance.metadata?.project || t('Default')}</FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Flex
                flexWrap={{ default: 'nowrap' }}
                gap={{ default: 'gapLg' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
              >
                <FlexItem>{t('Created')}</FlexItem>
                <FlexItem>{createdAt ?? '—'}</FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        }
        actionButton={
          <Button
            variant="primary"
            isBlock
            isDisabled={!canConnectSsh}
            onClick={() => setConnectSshOpen(true)}
          >
            {t('Connect via SSH')}
          </Button>
        }
      />
    </>
  );
};

export default BareMetalInstanceCard;
