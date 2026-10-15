import type { TFunction } from 'i18next';

import type { ExternalIPAttachment, Metadata } from '@osac/types';
import { ExternalIPAttachmentState } from '@osac/types';

export type BareMetalPowerStateFilter =
  | 'running'
  | 'stopped'
  | 'provisioning'
  | 'starting'
  | 'failing';

export const BARE_METAL_POWER_STATE_FILTERS: readonly BareMetalPowerStateFilter[] = [
  'running',
  'stopped',
  'provisioning',
  'starting',
  'failing',
];

export const isBareMetalPowerStateFilter = (value: string): value is BareMetalPowerStateFilter =>
  (BARE_METAL_POWER_STATE_FILTERS as readonly string[]).includes(value);

export const bareMetalPowerStateFilterLabel = (
  filter: BareMetalPowerStateFilter,
  t: TFunction,
): string => {
  switch (filter) {
    case 'running':
      return t('Running');
    case 'stopped':
      return t('Stopped');
    case 'provisioning':
      return t('Provisioning');
    case 'starting':
      return t('Starting');
    case 'failing':
      return t('Failed');
  }
};

const CARD_CREATED_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export const formatBareMetalCreatedAt = (value?: Metadata): string => {
  const timestamp = value?.creationTimestamp;
  if (!timestamp?.seconds) {
    return '-';
  }

  const date = new Date(
    Number(timestamp.seconds) * 1000 + Math.floor((timestamp.nanos ?? 0) / 1_000_000),
  );
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return CARD_CREATED_FORMAT.format(date);
};

export const getHostFromAttachments = (
  attachments: readonly ExternalIPAttachment[],
): string | undefined => {
  const readyWithAddress = attachments.filter((attachment) => {
    const address = attachment.status?.externalIpAddress?.trim();
    return (
      attachment.status?.state === ExternalIPAttachmentState.EXTERNAL_IP_ATTACHMENT_STATE_READY &&
      Boolean(address)
    );
  });
  if (readyWithAddress.length === 0) {
    return undefined;
  }

  const autoCreated = readyWithAddress.find(
    (attachment) => attachment.metadata?.labels?.['osac.openshift.io/auto-created'] === 'true',
  );
  return (autoCreated ?? readyWithAddress[0]).status?.externalIpAddress?.trim();
};

export const buildBareMetalSshHostByInstanceId = (
  attachments: readonly ExternalIPAttachment[],
): ReadonlyMap<string, string> => {
  const attachmentsByInstanceId = new Map<string, ExternalIPAttachment[]>();

  for (const attachment of attachments) {
    const target = attachment.spec?.target;
    if (target?.case !== 'baremetalInstance' || !target.value.id) {
      continue;
    }
    const instanceId = target.value.id;
    const existing = attachmentsByInstanceId.get(instanceId) ?? [];
    existing.push(attachment);
    attachmentsByInstanceId.set(instanceId, existing);
  }

  const hostsByInstanceId = new Map<string, string>();
  for (const [instanceId, instanceAttachments] of attachmentsByInstanceId) {
    const host = getHostFromAttachments(instanceAttachments);
    if (host) {
      hostsByInstanceId.set(instanceId, host);
    }
  }

  return hostsByInstanceId;
};

export const buildBareMetalSshCommand = (username: string, host: string): string =>
  `ssh ${username}@${host}`;
