import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Calendar, 
  Video,
  Settings,
  MessageCircle,
  Link2,
  BookOpen,
  Crown,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserManagement } from "./UserManagement";
import { BookingManagement } from "./BookingManagement";
import { ContentManager } from "./ContentManager";
import { CommunityLinkManager } from "./CommunityLinkManager";
import { QAManager } from "./QAManager";

export function ExecutiveDashboard() {
  const { user } = useAuth();
  
  const [pendingApplications, setPendingApplications] = useState(0);
  const [pendingSessions, setPendingSessions] = useState(0);
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);
  const [counselorCount, setCounselorCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [
        applicationsRes,
        sessionsRes,
        qaRes,
        counselorsRes,
        bookingsRes,
      ] = await Promise.all([
        supabase.from("counselor_applications").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("sessions").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("qa_threads").select("id", { count: "exact" }).is("reply", null),
        supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "counselor"),
        supabase.from("quick_bookings").select("id", { count: "exact" }).eq("is_contacted", false),
      ]);

      setPendingApplications(applicationsRes.count || 0);
      setPendingSessions(sessionsRes.count || 0);
      setUnansweredQuestions(qaRes.count || 0);
      setCounselorCount(counselorsRes.count || 0);
      setPendingBookings(bookingsRes.count || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Applications", 
      value: pendingApplications, 
      icon: FileText, 
      gradient: "from-amber-400 to-orange-500",
      bgColor: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      borderColor: "border-amber-200/50"
    },
    { 
      label: "Unassigned Sessions", 
      value: pendingSessions, 
      icon: Calendar, 
      gradient: "from-blue-400 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      borderColor: "border-blue-200/50"
    },
    { 
      label: "Questions", 
      value: unansweredQuestions, 
      icon: MessageCircle, 
      gradient: "from-purple-400 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      borderColor: "border-purple-200/50"
    },
    { 
      label: "Bookings", 
      value: pendingBookings, 
      icon: BookOpen, 
      gradient: "from-rose-400 to-red-500",
      bgColor: "from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20",
      borderColor: "border-rose-200/50"
    },
    { 
      label: "Counselors", 
      value: counselorCount, 
      icon: Users, 
      gradient: "from-green-400 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-200/50"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-background rounded-3xl p-8 border border-violet-500/20"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <span className="text-sm font-medium text-violet-600">Executive Dashboard</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Welcome, Executive!
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage the platform and oversee all operations.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <Card className={`border-0 shadow-lg bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} border overflow-hidden`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1.5 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Q&A</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <QAManager />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentManager />
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <CommunityLinkManager />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
