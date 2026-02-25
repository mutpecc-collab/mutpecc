import { useState, useEffect } from "react";
import { Calendar, Phone, Mail, CheckCircle, Clock, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

interface QuickBooking {
  id: string; name: string; email: string; phone: string; message: string | null;
  is_contacted: boolean; contacted_at: string | null; contacted_by: string | null; created_at: string;
}

type Session = Database["public"]["Tables"]["sessions"]["Row"];
type SessionStatus = Database["public"]["Enums"]["session_status"];

interface Counselor { user_id: string; full_name: string | null; email: string | null; }

export function BookingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<QuickBooking[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, sessionsRes, counselorsRes] = await Promise.all([
        supabase.from("quick_bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("sessions").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id").eq("role", "counselor"),
      ]);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (counselorsRes.data && counselorsRes.data.length > 0) {
        const userIds = counselorsRes.data.map((c) => c.user_id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
        if (profiles) setCounselors(profiles);
      }
    } catch (error) { console.error("Error fetching data:", error); }
    finally { setLoading(false); }
  };

  const getCounselorName = (userId: string | null) => {
    if (!userId) return null;
    const c = counselors.find(p => p.user_id === userId);
    return c?.full_name || c?.email || "Staff";
  };

  const handleMarkContacted = async (bookingId: string) => {
    const { error } = await supabase.from("quick_bookings").update({ is_contacted: true, contacted_by: user?.id, contacted_at: new Date().toISOString() }).eq("id", bookingId);
    if (error) { toast({ title: "Error", description: "Failed to update booking status.", variant: "destructive" }); }
    else { toast({ title: "Marked as Contacted", description: "Booking has been marked as contacted." }); fetchData(); }
  };

  const handleAssignCounselor = async (sessionId: string, counselorId: string) => {
    const { error } = await supabase.from("sessions").update({ counselor_id: counselorId, status: "assigned" as SessionStatus }).eq("id", sessionId);
    if (error) { toast({ title: "Error", description: "Failed to assign counselor.", variant: "destructive" }); }
    else { toast({ title: "Counselor Assigned" }); fetchData(); }
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    const { error } = await supabase.from("sessions").update({ status }).eq("id", sessionId);
    if (error) { toast({ title: "Error", description: "Failed to update session status.", variant: "destructive" }); }
    else { toast({ title: "Status Updated", description: `Session status changed to ${status}.` }); fetchData(); }
  };

  const pendingBookings = bookings.filter((b) => !b.is_contacted);
  const contactedBookings = bookings.filter((b) => b.is_contacted);
  const pendingSessions = sessions.filter((s) => s.status === "pending");
  const assignedSessions = sessions.filter((s) => s.status !== "pending");

  const pendingPagination = usePagination(pendingBookings, 10);
  const contactedPagination = usePagination(contactedBookings, 10);
  const sessionsPagination = usePagination(sessions, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "assigned": return "bg-purple-100 text-purple-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <Tabs defaultValue="bookings" className="space-y-6">
      <TabsList className="grid grid-cols-2 w-full max-w-md">
        <TabsTrigger value="bookings" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Quick Bookings</TabsTrigger>
        <TabsTrigger value="sessions" className="flex items-center gap-2"><Users className="w-4 h-4" />Sessions</TabsTrigger>
      </TabsList>

      <TabsContent value="bookings">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />Quick Booking Requests
              {pendingBookings.length > 0 && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">{pendingBookings.length} pending</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No booking requests yet</p>
            ) : (
              <div className="space-y-6">
                {pendingBookings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />Pending Contact ({pendingBookings.length})
                    </h4>
                    <div className="space-y-3">
                      {pendingPagination.paginatedItems.map((booking) => (
                        <div key={booking.id} className="p-4 bg-secondary/50 rounded-xl border-l-4 border-amber-400">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">{booking.name}</span>
                                <span className="text-xs text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><a href={`tel:${booking.phone}`} className="text-primary hover:underline">{booking.phone}</a></div>
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><a href={`mailto:${booking.email}`} className="text-primary hover:underline">{booking.email}</a></div>
                              </div>
                              {booking.message && <p className="text-sm text-muted-foreground bg-background p-2 rounded-lg">"{booking.message}"</p>}
                            </div>
                            <Button variant="warm" size="sm" onClick={() => handleMarkContacted(booking.id)}><CheckCircle className="w-4 h-4 mr-1" />Mark Contacted</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ShowMoreButton hasMore={pendingPagination.hasMore} onClick={pendingPagination.showMore} totalCount={pendingBookings.length} shownCount={pendingPagination.paginatedItems.length} />
                  </div>
                )}
                {contactedBookings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />Contacted ({contactedBookings.length})
                    </h4>
                    <div className="space-y-3">
                      {contactedPagination.paginatedItems.map((booking) => (
                        <div key={booking.id} className="p-4 bg-secondary/30 rounded-xl border-l-4 border-green-400">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <span className="font-medium text-foreground">{booking.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">{booking.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {booking.contacted_by && (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <User className="w-3 h-3" />{getCounselorName(booking.contacted_by)}
                                </span>
                              )}
                              <span>Contacted {booking.contacted_at && new Date(booking.contacted_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ShowMoreButton hasMore={contactedPagination.hasMore} onClick={contactedPagination.showMore} totalCount={contactedBookings.length} shownCount={contactedPagination.paginatedItems.length} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sessions">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />Booked Sessions
              {pendingSessions.length > 0 && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">{pendingSessions.length} unassigned</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sessions booked yet</p>
            ) : (
              <div className="space-y-6">
                {pendingSessions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" />Unassigned Sessions ({pendingSessions.length})</h4>
                    <div className="space-y-3">
                      {pendingSessions.map((session) => (
                        <div key={session.id} className="p-4 bg-secondary/50 rounded-xl border-l-4 border-amber-400">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{session.title}</h4>
                              <p className="text-sm text-muted-foreground">{session.description}</p>
                              {session.preferred_date && <p className="text-xs text-primary mt-1">Preferred: {new Date(session.preferred_date).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex flex-col gap-2 min-w-[180px]">
                              <Select onValueChange={(value) => handleAssignCounselor(session.id, value)}>
                                <SelectTrigger><SelectValue placeholder="Assign counselor" /></SelectTrigger>
                                <SelectContent>{counselors.map((c) => <SelectItem key={c.user_id} value={c.user_id}>{c.full_name || c.email || "Unknown"}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {assignedSessions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />All Sessions ({assignedSessions.length})</h4>
                    <div className="space-y-3">
                      {assignedSessions.map((session) => (
                        <div key={session.id} className="p-4 bg-secondary/30 rounded-xl">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{session.title}</h4>
                              <p className="text-sm text-muted-foreground">{session.description}</p>
                              {session.preferred_date && <p className="text-xs text-primary mt-1">Preferred: {new Date(session.preferred_date).toLocaleDateString()}</p>}
                              {session.counselor_id && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                                  <User className="w-3 h-3" />{getCounselorName(session.counselor_id)}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status || "")}`}>{session.status}</span>
                              {session.status !== "completed" && session.status !== "cancelled" && (
                                <Select onValueChange={(value) => handleUpdateSessionStatus(session.id, value as SessionStatus)}>
                                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Update status" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
