import { useMemo } from 'react';

import { type BareMetalInstance, BareMetalInstanceState, ExternalIPAttachments } from '@osac/types';
import { useListResource } from '@osac/ui-components/api/use-resource';
import { bareMetalInstanceAttachmentsFilter } from '@osac/ui-components/api/v1/external-ip-data';

import { buildBareMetalSshHostByInstanceId } from './bareMetalInstanceDisplay';

const runningBareMetalInstanceIds = (instances: readonly BareMetalInstance[]): string[] =>
  instances
    .filter(
      (instance) =>
        instance.status?.state === BareMetalInstanceState.RUNNING && Boolean(instance.id),
    )
    .map((instance) => instance.id);

export const useBareMetalSshHosts = (
  instances: readonly BareMetalInstance[],
): ReadonlyMap<string, string> => {
  const runningInstanceIds = useMemo(() => runningBareMetalInstanceIds(instances), [instances]);
  const filter = useMemo(
    () => bareMetalInstanceAttachmentsFilter(runningInstanceIds),
    [runningInstanceIds],
  );

  const { data: externalIpAttachmentResponse } = useListResource(
    ExternalIPAttachments,
    { filter },
    { enabled: runningInstanceIds.length > 0 },
  );

  return useMemo(() => {
    const externalIpAttachments = externalIpAttachmentResponse?.items ?? [];
    return buildBareMetalSshHostByInstanceId(externalIpAttachments);
  }, [externalIpAttachmentResponse?.items]);
};
