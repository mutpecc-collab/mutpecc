import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MessageCircle, 
  GraduationCap, 
  Clock, 
  Send,
  Plus,
  User,
  Sparkles,
  TrendingUp,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookSessionModal } from "./BookSessionModal";
import { ApplyCounselorModal } from "./ApplyCounselorModal";
import { BookingTracker } from "./BookingTracker";
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];
type Activity = Database["public"]["Tables"]["activities"]["Row"];
type Session = Database["public"]["Tables"]["sessions"]["Row"];
type QAThread = Database["public"]["Tables"]["qa_threads"]["Row"];

export function MemberDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [qaThreads, setQAThreads] = useState<QAThread[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [eventsRes, activitiesRes, sessionsRes, qaRes] = await Promise.all([
        supabase.from("events").select("*").eq("is_published", true).order("event_date", { ascending: true }),
        supabase.from("activities").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("qa_threads").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (eventsRes.data) setEvents(eventsRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (qaRes.data) setQAThreads(qaRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    const { error } = await supabase.from("qa_threads").insert({
      user_id: user.id,
      question: newQuestion.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Question Submitted",
        description: "An executive will respond to your question soon.",
      });
      setNewQuestion("");
      fetchData();
    }
  };

  const completedSessions = sessions.filter(s => s.status === "completed").length;
  const totalSessions = sessions.length;
  const answeredQuestions = qaThreads.filter(q => q.reply).length;

  return (
    <div className="space-y-8">
      {/* Welcome Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Member Dashboard</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-foreground">
                  Welcome Back!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your mental wellness journey continues here.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="hero" size="lg" onClick={() => setIsBookingOpen(true)} className="shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Book Session
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsApplyOpen(true)}>
                <GraduationCap className="w-5 h-5 mr-2" />
                Become Counselor
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedSessions}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{qaThreads.length}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{answeredQuestions}</p>
                  <p className="text-xs text-muted-foreground">Answered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Sessions & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    My Sessions
                  </span>
                  {sessions.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {completedSessions}/{totalSessions} completed
                    </span>
                  )}
                </CardTitle>
                {sessions.length > 0 && (
                  <Progress value={(completedSessions / totalSessions) * 100} className="h-2" />
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 bg-secondary/30 rounded-xl">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-4">
                      You haven't booked any sessions yet
                    </p>
                    <Button variant="hero" size="sm" onClick={() => setIsBookingOpen(true)}>
                      Book Your First Session
                    </Button>
                  </div>
                ) : (
                  sessions.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-colors border border-border/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{session.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {session.description}
                          </p>
                          {session.preferred_date && (
                            <p className="text-xs text-primary mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.preferred_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          session.status === "completed" ? "bg-green-100 text-green-700" :
                          session.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                          session.status === "assigned" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {session.status?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ask Executive Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Ask an Executive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <Button variant="hero" onClick={handleAskQuestion} disabled={!newQuestion.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {qaThreads.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {qaThreads.slice(0, 3).map((thread) => (
                      <div key={thread.id} className="p-4 bg-secondary/30 rounded-xl border border-border/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{thread.question}</p>
                            {thread.reply ? (
                              <div className="mt-3 pl-3 border-l-2 border-green-500">
                                <p className="text-sm text-foreground">{thread.reply}</p>
                                <p className="text-xs text-green-600 mt-1">Executive replied</p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                Awaiting response...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Events & Booking Tracker */}
        <div className="space-y-6">
          {/* Booking Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <BookingTracker />
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 text-sm">
                    No upcoming events
                  </p>
                ) : (
                  events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-secondary/30 rounded-xl border border-border/30 hover:bg-secondary/50 transition-colors"
                    >
                      <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                        <Clock className="w-3 h-3" />
                        {new Date(event.event_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 text-sm">
                    No activities yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 3).map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 bg-secondary/30 rounded-xl border border-border/30"
                      >
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {activity.activity_type || "General"}
                        </span>
                        <h4 className="font-medium text-foreground text-sm mt-2">{activity.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <BookSessionModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onSuccess={fetchData}
      />
      <ApplyCounselorModal 
        isOpen={isApplyOpen} 
        onClose={() => setIsApplyOpen(false)} 
      />
    </div>
  );
}
