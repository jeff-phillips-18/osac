import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { type BareMetalInstance } from '@osac/types';
import { type CelFilter } from '@osac/ui-components/api/cel';
import { useBareMetalInstances } from '@osac/ui-components/api/v1/baremetal-instance';
import PageView from '@osac/ui-components/components/Page/PageView';
import ProjectFilter from '@osac/ui-components/components/Page/ProjectFilter';
import { ViewableListSection } from '@osac/ui-components/components/Page/ViewableListSection';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import ViewSwitcher from '@osac/ui-components/components/Primitives/ViewSwitcher';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter';
import { PROJECT_FILTER_PARAM, useSession } from '@osac/ui-components/hooks/use-session';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { buildBareMetalListFilter } from './baremetal-instance-list-filter';
import BareMetalInstanceCard from './BareMetalInstanceCard';
import { BareMetalTable } from './BareMetalTable';
import { isBareMetalPowerStateFilter } from '../bareMetalInstanceDisplay';
import { useBareMetalSshHosts } from '../useBareMetalSshHosts';
import BareMetalDiskImageFilter from './Filters/BareMetalDiskImageFilter';
import BareMetalInstanceTypeFilter from './Filters/BareMetalInstanceTypeFilter';
import BareMetalPowerStateFilter from './Filters/BareMetalPowerStateFilter';

const POWER_STATE_FILTER_PARAM = 'powerState';
const INSTANCE_TYPE_FILTER_PARAM = 'instanceType';
const DISK_IMAGE_FILTER_PARAM = 'diskImage';

const BARE_METAL_LIST_VIEW_KEY = 'bare-metal-list';

export const BareMetalListPage = () => {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const { projects, setProjects } = useSession();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);
  const [powerStateFilterParam, setPowerStateFilterParam] = usePageFilter(POWER_STATE_FILTER_PARAM);
  const [instanceTypeFilterParam, setInstanceTypeFilterParam] = usePageFilter(
    INSTANCE_TYPE_FILTER_PARAM,
  );
  const [diskImageFilterParam, setDiskImageFilterParam] = usePageFilter(DISK_IMAGE_FILTER_PARAM);
  const powerStateFilter = isBareMetalPowerStateFilter(powerStateFilterParam)
    ? powerStateFilterParam
    : undefined;

  const listFilter = useMemo(
    (): CelFilter<BareMetalInstance> | undefined =>
      buildBareMetalListFilter({
        search,
        powerState: powerStateFilter,
        instanceType: instanceTypeFilterParam.trim(),
        diskImage: diskImageFilterParam.trim(),
      }),
    [diskImageFilterParam, instanceTypeFilterParam, powerStateFilter, search],
  );

  const {
    instances,
    isLoading,
    error: instancesError,
    totalItems,
  } = useBareMetalInstances(listFilter);

  const sshHostsByInstanceId = useBareMetalSshHosts(instances);

  const isFiltered = Boolean(
    search ||
    projects.length ||
    powerStateFilter ||
    instanceTypeFilterParam.trim() ||
    diskImageFilterParam.trim(),
  );
  const showEmptyState = !isLoading && !instancesError && instances.length === 0;

  const clearAllFilters = () => {
    setProjects([]);
    requestAnimationFrame(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(SEARCH_PARAM);
          next.delete(PROJECT_FILTER_PARAM);
          next.delete(POWER_STATE_FILTER_PARAM);
          next.delete(INSTANCE_TYPE_FILTER_PARAM);
          next.delete(DISK_IMAGE_FILTER_PARAM);
          return next;
        },
        { replace: true },
      );
    });
  };

  const emptyState =
    totalItems === 0 && !isFiltered ? (
      <EmptyState titleText={t('No bare metal instances found')} headingLevel="h2">
        <EmptyStateBody>{t('No bare metal instances are available yet.')}</EmptyStateBody>
      </EmptyState>
    ) : (
      <EmptyState titleText={t('No bare metal instances match your filters')} headingLevel="h2">
        <EmptyStateBody>
          {t('Try a different project, power state, instance type, disk image, or search term.')}{' '}
          <Button variant="link" isInline onClick={clearAllFilters}>
            {t('Clear all filters')}
          </Button>
        </EmptyStateBody>
      </EmptyState>
    );

  const filteredText =
    instances.length === totalItems
      ? t('{{count}} bare metal instance', { count: totalItems })
      : t('{{shown}} of {{count}} bare metal instance', {
          shown: instances.length,
          count: totalItems,
        });

  const toolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <ProjectFilter />
        </ToolbarItem>
        <ToolbarItem>
          <BareMetalPowerStateFilter
            selected={powerStateFilter}
            onChange={(value) => setPowerStateFilterParam(value ?? '')}
          />
        </ToolbarItem>
        <ToolbarItem>
          <BareMetalInstanceTypeFilter
            selected={instanceTypeFilterParam.trim()}
            onChange={(value) => setInstanceTypeFilterParam(value ?? '')}
          />
        </ToolbarItem>
        <ToolbarItem>
          <BareMetalDiskImageFilter
            selected={diskImageFilterParam.trim()}
            onChange={(value) => setDiskImageFilterParam(value ?? '')}
          />
        </ToolbarItem>
        <ToolbarItem>
          <SearchInput
            placeholder={t('Search by name')}
            value={search}
            onChange={(_e, v) => setSearch(v)}
            onClear={() => setSearch('')}
            aria-label={t('Filter bare metal instances by name')}
          />
        </ToolbarItem>
        <ToolbarGroup align={{ default: 'alignEnd' }}>
          <ToolbarItem>
            <ViewSwitcher pageKey={BARE_METAL_LIST_VIEW_KEY} />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  return (
    <PageView
      title={t('Bare Metal')}
      description={t('Monitor and manage bare metal instances across all projects.')}
      error={instancesError}
      actions={<CreateButton to="/bare-metal/create">{t('Provision bare metal')}</CreateButton>}
      toolbar={toolbar}
      showEmptyState={showEmptyState}
      emptyState={emptyState}
      filteredText={filteredText}
      isFiltered={isFiltered}
      onClearAllFilters={clearAllFilters}
      pageBody={{ isLoading, error: instancesError }}
      listSection={
        <ViewableListSection
          items={instances}
          pageKey={BARE_METAL_LIST_VIEW_KEY}
          getItemKey={(instance) => instance.id}
          renderCard={(instance) => (
            <BareMetalInstanceCard
              instance={instance}
              sshHost={sshHostsByInstanceId?.get(instance.id)}
            />
          )}
          renderList={(bareMetalInstances) => (
            <BareMetalTable
              instances={bareMetalInstances}
              sshHostsByInstanceId={sshHostsByInstanceId}
            />
          )}
        />
      }
    />
  );
};
