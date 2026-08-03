import { getWorkspaceAnalytics } from "@/features/analytics/repositories/workspace-analytics.repository";
import { getUpcomingMeetings } from "@/features/calendar/repositories/meeting.repository";
import { getDashboardRecentActivity } from "@/features/dashboard/repositories/dashboard.repository";

type GetDashboardDataParams = {
  workspaceId: string;
  locale: string;
};

export async function getDashboardData({
  workspaceId,
  locale,
}: GetDashboardDataParams) {
  const [
    analytics,
    recentActivity,
    upcomingMeetings,
  ] = await Promise.all([
    getWorkspaceAnalytics(workspaceId),

    getDashboardRecentActivity({
      workspaceId,
      locale,
    }),

    getUpcomingMeetings({
      workspaceId,
      limit: 6,
    }),
  ]);

  return {
    overview: analytics.overview,

    employeePerformance:
      analytics.employeePerformance,

    recentConversations:
      analytics.recentConversations,

    channelBreakdown:
      analytics.channelBreakdown,

    dailyConversations:
      analytics.dailyConversations,

    recentActivity,

    upcomingMeetings,
  };
}

export type DashboardData = Awaited<
  ReturnType<typeof getDashboardData>
>;
