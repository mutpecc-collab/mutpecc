import { useState, useEffect } from "react";
import { MessageCircle, Send, CheckCircle, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type QAThread = Database["public"]["Tables"]["qa_threads"]["Row"];

interface CounselorProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export function QAManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [counselorProfiles, setCounselorProfiles] = useState<CounselorProfile[]>([]);

  useEffect(() => { fetchThreads(); }, [filter]);

  const fetchThreads = async () => {
    try {
      let query = supabase.from("qa_threads").select("*").order("created_at", { ascending: false });
      if (filter === "unanswered") query = query.is("reply", null);
      else if (filter === "answered") query = query.not("reply", "is", null);
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setThreads(data);
        // Fetch counselor profiles for replied_by
        const repliedByIds = data.filter(t => t.replied_by).map(t => t.replied_by!);
        if (repliedByIds.length > 0) {
          const uniqueIds = [...new Set(repliedByIds)];
          const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", uniqueIds);
          if (profiles) setCounselorProfiles(profiles);
        }
      }
    } catch (error) { console.error("Error fetching Q&A threads:", error); }
    finally { setLoading(false); }
  };

  const getCounselorName = (userId: string | null) => {
    if (!userId) return null;
    const profile = counselorProfiles.find(p => p.user_id === userId);
    return profile?.full_name || profile?.email || "Counselor";
  };

  const handleReply = async (threadId: string, reply: string) => {
    if (!user || !reply.trim()) return;
    const { error } = await supabase.from("qa_threads").update({ reply: reply.trim(), replied_by: user.id, replied_at: new Date().toISOString() }).eq("id", threadId);
    if (error) { toast({ title: "Error", description: "Failed to send reply.", variant: "destructive" }); }
    else { toast({ title: "Reply Sent", description: "Your response has been saved." }); fetchThreads(); }
  };

  const togglePublic = async (threadId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("qa_threads").update({ is_public: !currentStatus }).eq("id", threadId);
    if (error) { toast({ title: "Error", description: "Failed to update visibility.", variant: "destructive" }); }
    else { toast({ title: "Visibility Updated", description: currentStatus ? "Question is now private." : "Question is now public." }); fetchThreads(); }
  };

  const unansweredCount = threads.filter(t => !t.reply).length;
  const { paginatedItems, hasMore, showMore } = usePagination(threads, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Questions & Answers
            {unansweredCount > 0 && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">{unansweredCount} unanswered</span>}
          </div>
          <div className="flex gap-2">
            <Button variant={filter === "unanswered" ? "default" : "outline"} size="sm" onClick={() => setFilter("unanswered")}>Unanswered</Button>
            <Button variant={filter === "answered" ? "default" : "outline"} size="sm" onClick={() => setFilter("answered")}>Answered</Button>
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : threads.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{filter === "unanswered" ? "No unanswered questions!" : "No questions found."}</p>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedItems.map((thread) => (
                <div key={thread.id} className={`p-4 bg-secondary/50 rounded-xl ${!thread.reply ? "border-l-4 border-amber-400" : "border-l-4 border-green-400"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {thread.guest_name || "Member"}
                        {thread.guest_phone && <span className="text-muted-foreground ml-2">({thread.guest_phone})</span>}
                        {thread.guest_email && <span className="text-muted-foreground ml-2">• {thread.guest_email}</span>}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(thread.created_at).toLocaleDateString()} at {new Date(thread.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {thread.reply && (
                      <Button variant="ghost" size="sm" onClick={() => togglePublic(thread.id, thread.is_public || false)} className="flex items-center gap-1">
                        {thread.is_public ? <><Eye className="w-4 h-4" /><span className="text-xs">Public</span></> : <><EyeOff className="w-4 h-4" /><span className="text-xs">Private</span></>}
                      </Button>
                    )}
                  </div>
                  <p className="text-foreground mb-3 bg-background/50 p-3 rounded-lg">{thread.question}</p>
                  {thread.reply ? (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Replied</span>
                        {thread.replied_by && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getCounselorName(thread.replied_by)}
                          </span>
                        )}
                        {thread.replied_at && <span className="text-xs text-muted-foreground">on {new Date(thread.replied_at).toLocaleDateString()}</span>}
                      </div>
                      <p className="text-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{thread.reply}</p>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-border">
                      <ReplyInput onSubmit={(reply) => handleReply(thread.id, reply)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <ShowMoreButton hasMore={hasMore} onClick={showMore} totalCount={threads.length} shownCount={paginatedItems.length} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReplyInput({ onSubmit }: { onSubmit: (reply: string) => void }) {
  const [reply, setReply] = useState("");
  return (
    <div className="space-y-2">
      <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply to this question..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm min-h-[80px] resize-none" />
      <div className="flex justify-end">
        <Button variant="warm" size="sm" onClick={() => { if (reply.trim()) { onSubmit(reply.trim()); setReply(""); } }} disabled={!reply.trim()} className="flex items-center gap-2">
          <Send className="w-4 h-4" />Send Reply
        </Button>
      </div>
    </div>
  );
}
