import { describe, expect, it } from 'vitest';

import { buildBareMetalListFilter } from './baremetal-instance-list-filter';

describe('buildBareMetalListFilter', () => {
  it('filters by instance type name on spec.instance_type', () => {
    const filter = buildBareMetalListFilter({ instanceType: 'gpu-large' });

    expect(filter).toBe('this.spec.instance_type.name == "gpu-large"');
  });

  it('filters by disk image name on spec.disk_image', () => {
    const filter = buildBareMetalListFilter({ diskImage: 'RHEL 9.4' });

    expect(filter).toBe('this.spec.disk_image.name == "RHEL 9.4"');
  });
});
