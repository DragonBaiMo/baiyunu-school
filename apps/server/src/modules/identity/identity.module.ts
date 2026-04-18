import type { DynamicModule } from '@nestjs/common';
import { IdentityModule as IdentityDomainModule } from '@bynu/service-identity';

export {
  IdentityService,
  IdentityController,
  ApplicationService,
  CardService,
  ProfileService,
} from '@bynu/service-identity';

export class IdentityModule {
  static register(): DynamicModule {
    return IdentityDomainModule.register();
  }
}
