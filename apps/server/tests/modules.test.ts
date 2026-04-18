import { describe, expect, it } from 'vitest';
import { ActivityController, ActivityService } from '@bynu/service-activity';
import { DonationController, DonationService } from '@bynu/service-donation';
import { EtlController, EtlService } from '@bynu/service-etl';
import { IdentityController, IdentityService } from '@bynu/service-identity';
import { NotificationController, NotificationService } from '@bynu/service-notification';
import { OrganizationController, OrganizationService } from '@bynu/service-organization';
import { PortalCmsController, PortalCmsService } from '@bynu/service-portal-cms';
import { WorkflowController, WorkflowService } from '@bynu/service-workflow';

describe('8 个领域模块 controller ping', () => {
  it.each([
    ['identity', () => new IdentityController(new IdentityService())],
    ['portal-cms', () => new PortalCmsController(new PortalCmsService())],
    ['etl', () => new EtlController(new EtlService())],
    ['activity', () => new ActivityController(new ActivityService())],
    ['donation', () => new DonationController(new DonationService())],
    ['workflow', () => new WorkflowController(new WorkflowService())],
    ['organization', () => new OrganizationController(new OrganizationService())],
    ['notification', () => new NotificationController(new NotificationService())],
  ])('%s controller.ping 返回模块名', (name, build) => {
    const ctrl = build() as { ping: () => { module: string } };
    const out = ctrl.ping();
    expect(out.module).toBe(name);
  });
});
