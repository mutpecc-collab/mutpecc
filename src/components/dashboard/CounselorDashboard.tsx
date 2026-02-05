import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  MessageCircle,
  Send,
  Sparkles,
  HeartHandshake,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type MoodForm = Database["public"]["Tables"]["mood_forms"]["Row"];
type Session = Database["public"]["Tables"]["sessions"]["Row"];
type QAThread = Database["public"]["Tables"]["qa_threads"]["Row"];

export function CounselorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unclaimedForms, setUnclaimedForms] = useState<MoodForm[]>([]);
  const [claimedForms, setClaimedForms] = useState<MoodForm[]>([]);
  const [assignedSessions, setAssignedSessions] = useState<Session[]>([]);
  const [qaThreads, setQAThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [unclaimedRes, claimedRes, sessionsRes, qaRes] = await Promise.all([
        supabase.from("mood_forms").select("*").eq("is_claimed", false).order("created_at", { ascending: false }),
        supabase.from("mood_forms").select("*").eq("claimed_by", user.id).order("created_at", { ascending: false }),
        supabase.from("sessions").select("*").eq("counselor_id", user.id).order("created_at", { ascending: false }),
        supabase.from("qa_threads").select("*").order("created_at", { ascending: false }),
      ]);

      if (unclaimedRes.data) setUnclaimedForms(unclaimedRes.data);
      if (claimedRes.data) setClaimedForms(claimedRes.data);
      if (sessionsRes.data) setAssignedSessions(sessionsRes.data);
      if (qaRes.data) setQAThreads(qaRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimForm = async (formId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("mood_forms")
      .update({
        is_claimed: true,
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .eq("is_claimed", false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to claim this request. It may have been claimed by another counselor.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Claimed",
        description: "You can now contact this person.",
      });
      fetchData();
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: string) => {
    const { error } = await supabase
      .from("sessions")
      .update({ status: status as any })
      .eq("id", sessionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update session status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Session marked as ${status}.`,
      });
      fetchData();
    }
  };

  const handleReplyQuestion = async (threadId: string) => {
    const reply = replyText[threadId];
    if (!reply?.trim()) return;

    const { error } = await supabase
      .from("qa_threads")
      .update({
        reply,
        replied_by: user?.id,
        replied_at: new Date().toISOString(),
      })
      .eq("id", threadId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send reply.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent.",
      });
      setReplyText(prev => ({ ...prev, [threadId]: "" }));
      fetchData();
    }
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      anxious: "😰",
      stressed: "😫",
      confused: "😕",
      hopeful: "🌟",
      angry: "😠",
      neutral: "😐",
    };
    return emojis[mood] || "😐";
  };

  const unansweredQuestions = qaThreads.filter(q => !q.reply);
  const completedSessions = assignedSessions.filter(s => s.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-background rounded-3xl p-8 border border-blue-500/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <HeartHandshake className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Counselor Dashboard</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Welcome, Counselor!
              </h1>
              <p className="text-muted-foreground mt-1">
                Help those in need and make a difference today.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{unclaimedForms.length}</p>
                  <p className="text-xs text-muted-foreground">New Requests</p>
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{claimedForms.length}</p>
                  <p className="text-xs text-muted-foreground">My Clients</p>
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{unansweredQuestions.length}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedSessions}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            New Requests
            {unclaimedForms.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                {unclaimedForms.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="clients" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            My Clients
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageCircle className="w-4 h-4 mr-2" />
            Q&A
          </TabsTrigger>
        </TabsList>

        {/* Unclaimed Mood Requests */}
        <TabsContent value="requests">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                New Mood Check-in Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unclaimedForms.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-sm">No new requests at the moment</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {unclaimedForms.map((form) => (
                    <motion.div
                      key={form.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-amber-400 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-3xl">{getMoodEmoji(form.mood)}</span>
                            <div>
                              <p className="font-semibold text-foreground">{form.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{form.mood}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {form.feelings || "No details provided"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(form.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="hero"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleClaimForm(form.id)}
                      >
                        <HeartHandshake className="w-4 h-4 mr-2" />
                        Pick & Respond
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Claimed Clients */}
        <TabsContent value="clients">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                My Assigned Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claimedForms.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>You haven't claimed any clients yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claimedForms.map((form) => (
                    <motion.div
                      key={form.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200/50"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg">
                          {getMoodEmoji(form.mood)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{form.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{form.mood}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <a href={`tel:${form.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone className="w-4 h-4" />
                          {form.phone}
                        </a>
                        <a href={`mailto:${form.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Mail className="w-4 h-4" />
                          {form.email}
                        </a>
                      </div>

                      {form.feelings && (
                        <div className="mt-4 pt-3 border-t border-blue-200/50">
                          <p className="text-xs text-muted-foreground mb-1">Feelings:</p>
                          <p className="text-sm text-foreground">{form.feelings}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assigned Sessions */}
        <TabsContent value="sessions">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>My Sessions</CardTitle>
                {assignedSessions.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {completedSessions}/{assignedSessions.length} completed
                  </span>
                )}
              </div>
              {assignedSessions.length > 0 && (
                <Progress value={(completedSessions / assignedSessions.length) * 100} className="h-2 mt-2" />
              )}
            </CardHeader>
            <CardContent>
              {assignedSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No sessions assigned to you yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-secondary/30 rounded-xl flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{session.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{session.description}</p>
                        {session.preferred_date && (
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.preferred_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          session.status === "completed" ? "bg-green-100 text-green-700" :
                          session.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {session.status?.replace("_", " ")}
                        </span>
                        {session.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateSessionStatus(
                              session.id,
                              session.status === "assigned" ? "in_progress" : "completed"
                            )}
                          >
                            {session.status === "assigned" ? "Start" : "Complete"}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="questions">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Member Questions
                {unansweredQuestions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                    {unansweredQuestions.length} unanswered
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qaThreads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No questions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qaThreads.map((thread) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border-l-4 ${
                        thread.reply 
                          ? "bg-green-50 dark:bg-green-900/20 border-green-400" 
                          : "bg-amber-50 dark:bg-amber-900/20 border-amber-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {thread.guest_name || "Member"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(thread.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-foreground mb-3">{thread.question}</p>
                      
                      {thread.reply ? (
                        <div className="pl-4 border-l-2 border-green-500 mt-3">
                          <p className="text-sm text-foreground">{thread.reply}</p>
                          <p className="text-xs text-green-600 mt-1">Replied</p>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={replyText[thread.id] || ""}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [thread.id]: e.target.value }))}
                            placeholder="Type your reply..."
                            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleReplyQuestion(thread.id)}
                            disabled={!replyText[thread.id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
