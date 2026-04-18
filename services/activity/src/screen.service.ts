/**
 * 大屏数据：聚合统计 + 最近签到。
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { ActivityCoreService } from './activity.service.js';
import { ACT_DB, type ActivityScreenSummary } from './types.js';

interface RecentRow {
  id: string;
  alumni_id: string;
  check_in_at: string | Date;
}

@Injectable()
export class ActivityScreenService {
  constructor(
    @Optional() @Inject(ACT_DB) private readonly db: DbClient,
    private readonly activities: ActivityCoreService,
  ) {}

  async summary(activityId: string): Promise<ActivityScreenSummary> {
    const activity = await this.activities.getById(activityId);
    const countsRes = await this.db.query<{
      enrolled: string;
      checked: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE status <> 'cancelled')::text AS enrolled,
         COUNT(*) FILTER (WHERE status = 'checked')::text AS checked
       FROM activity_enrollment
       WHERE activity_id = $1`,
      [activityId],
    );
    const enrolled = Number(countsRes.rows[0]?.enrolled ?? 0);
    const checked = Number(countsRes.rows[0]?.checked ?? 0);
    const checkInRate = enrolled === 0 ? 0 : checked / enrolled;
    const recentRes = await this.db.query(
      `SELECT id, alumni_id, check_in_at
       FROM activity_enrollment
       WHERE activity_id = $1 AND status = 'checked' AND check_in_at IS NOT NULL
       ORDER BY check_in_at DESC
       LIMIT 10`,
      [activityId],
    );
    const recentCheckIns = (recentRes.rows as unknown as RecentRow[]).map(
      (r) => ({
        enrollmentId: r.id,
        alumniId: r.alumni_id,
        checkInAt: new Date(r.check_in_at),
      }),
    );
    return {
      quota: activity.quota,
      enrolled,
      checked,
      checkInRate,
      recentCheckIns,
    };
  }
}
