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
      icon: <Video className="h-5 w-5 text-green-400" />,
    },
    {
      label: "Avg. Score",
      value: userStats?.averageScore ? `${userStats.averageScore}/10` : "0/10",
      icon: <BarChart2 className="h-5 w-5 text-green-400" />,
    },
    {
      label: "Best Performance",
      value: userStats?.bestScore ? `${userStats.bestScore}/10` : "0/10",
      icon: <Trophy className="h-5 w-5 text-green-400" />,
    },
    {
      label: "Hours Practiced",
      value: userStats?.totalHours.toString() || "0",
      icon: <Clock className="h-5 w-5 text-green-400" />,
    },
  ];

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-gray-400" />
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
          className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors"
        >
          Start Practice Interview
        </Link>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-green-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{stat.label}</span>
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
          <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">
                      {activity.type}
                    </span>
                    <span className="text-sm text-gray-400">
                      {activity.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate max-w-[90%]">
                      {activity.title}
                    </span>
                    {activity.score && (
                      <span className="text-green-400 flex-shrink-0 ml-2">
                        {activity.score}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
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
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="font-medium text-gray-100">
                      Current Plan:{" "}
                      {subscriptionInfo?.isProUser ? "Pro" : "Free"}
                    </p>
                    <p className="text-sm text-gray-400">
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
                        className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 w-full"
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
