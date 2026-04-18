/**
 * workflow Nest 装配。
 */

import {
  Controller,
  Get,
  Inject,
  Injectable,
  Module,
  OnModuleInit,
  type DynamicModule,
  type Provider,
} from '@nestjs/common';
import { ensureMigrated, getDbSingleton, type DbClient } from '@bynu/db';
import { ProofService, ensureProofTable } from './proof.service.js';
import { ReservationService } from './reservation.service.js';
import { WorkflowRolesGuard } from './roles.guard.js';
import {
  AlumniWorkflowController,
  PublicWorkflowController,
} from './workflow.controller.js';
import { WF_DB, WF_SALT } from './types.js';

/** 保留 ping service，server modules.test.ts 仍在引用。 */
@Injectable()
export class WorkflowService {
  readonly moduleName = 'workflow';
  ping(): string {
    return 'workflow-service ready';
  }
}

@Controller('internal/workflow')
export class WorkflowController {
  constructor(private readonly svc: WorkflowService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Injectable()
export class WorkflowBootstrap implements OnModuleInit {
  constructor(@Inject(WF_DB) private readonly db: DbClient) {}

  async onModuleInit(): Promise<void> {
    await ensureMigrated(this.db);
    await ensureProofTable(this.db);
  }
}

export interface WorkflowModuleOptions {
  db?: DbClient;
  salt?: string;
}

@Module({})
export class WorkflowModule {
  static register(): DynamicModule {
    return WorkflowModule.forRoot({});
  }

  static forRoot(opts: WorkflowModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: WF_DB,
        useFactory: () => opts.db ?? getDbSingleton(),
      },
      {
        provide: WF_SALT,
        useFactory: () =>
          opts.salt ??
          process.env['WORKFLOW_PROOF_SALT'] ??
          'bynu-default-salt',
      },
      ReservationService,
      ProofService,
      WorkflowRolesGuard,
      WorkflowService,
      WorkflowBootstrap,
    ];
    return {
      module: WorkflowModule,
      providers,
      controllers: [
        AlumniWorkflowController,
        PublicWorkflowController,
        WorkflowController,
      ],
      exports: [ReservationService, ProofService, WorkflowService],
    };
  }
}
