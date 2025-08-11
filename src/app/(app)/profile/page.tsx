import { Button } from "@/components/ui/button";
import { customerPortalAction } from "@/lib/payments/actions";
import { getUserSubscriptionInfo } from "@/lib/stripe-tables";
import {
  getRecentActivity,
  getUserStats,
  RecentActivity,
} from "@/utils/api/user-stats";
import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { BarChart2, Clock, Trophy, User, Video } from "lucide-react";
import Link from "next/link";
import { UpgradeButton } from "./upgrade-button";

export default async function Profile() {
  const supabase = await createClientForServer();
  const session = await supabase.auth.getUser();
  const { user } = session.data;

  // Fetch user profile data including subscription info and statistics
  let subscriptionInfo = null;
  let userStats = null;
  let recentActivity: RecentActivity[] = [];

  if (user) {
    subscriptionInfo = await getUserSubscriptionInfo(user.id);
    userStats = await getUserStats(user.id);
    recentActivity = await getRecentActivity(user.id);
  }

  const stats = [
    {
      label: "Practice Interviews",
      value: userStats?.totalInterviews.toString() || "0",
      icon: <Video className="h-5 w-5 text-brand" />,
    },
    {
      label: "Avg. Score",
      value: userStats?.averageScore ? `${userStats.averageScore}/10` : "0/10",
      icon: <BarChart2 className="h-5 w-5 text-brand" />,
    },
    {
      label: "Best Performance",
      value: userStats?.bestScore ? `${userStats.bestScore}/10` : "0/10",
      icon: <Trophy className="h-5 w-5 text-brand" />,
    },
    {
      label: "Minutes Practiced",
      value: userStats?.totalMinutes.toString() || "0",
      icon: <Clock className="h-5 w-5 text-brand" />,
    },
  ];

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center border border-border">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">
              {user?.user_metadata
                ? `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`
                : session.data.user?.email}
            </h1>
            <p className="text-gray-400">{session.data.user?.email}</p>
          </div>
        </div>
        <Link
          href={paths.questions}
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-medium px-4 py-2 rounded-md transition-colors"
        >
          Start Practice Interview
        </Link>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 hover:border-brand/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {activity.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {activity.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate max-w-[90%]">
                      {activity.title}
                    </span>
                    {activity.score && (
                      <span className="text-brand flex-shrink-0 ml-2">
                        {activity.score}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No practice interviews yet</p>
                <p className="text-sm mt-2">
                  Start your first interview to see your activity here
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Subscription</h2>

          {/* Subscription Management */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Current Plan:{" "}
                      {subscriptionInfo?.isProUser ? "Pro" : "Free"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionInfo?.isProUser
                        ? `Billed ${subscriptionInfo?.billingPeriod}`
                        : "No active subscription"}
                    </p>
                  </div>
                  {subscriptionInfo?.isProUser ? (
                    <form action={customerPortalAction}>
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                      >
                        Manage Subscription
                      </Button>
                    </form>
                  ) : (
                    <UpgradeButton />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
