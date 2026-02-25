import { useState, useEffect } from "react";
import { Video, Calendar, Activity, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AddVlogModal } from "./AddVlogModal";
import { AddEventModal } from "./AddEventModal";
import { AddActivityModal } from "./AddActivityModal";
import type { Database } from "@/integrations/supabase/types";

type Vlog = Database["public"]["Tables"]["vlogs"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];
type ActivityItem = Database["public"]["Tables"]["activities"]["Row"];

export function ContentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVlogModalOpen, setIsVlogModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const vlogPagination = usePagination(vlogs, 10);
  const eventPagination = usePagination(events, 10);
  const activityPagination = usePagination(activities, 10);

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      const [vlogsRes, eventsRes, activitiesRes] = await Promise.all([
        supabase.from("vlogs").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("event_date", { ascending: true }),
        supabase.from("activities").select("*").order("created_at", { ascending: false }),
      ]);
      if (vlogsRes.data) setVlogs(vlogsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
    } catch (error) { console.error("Error fetching content:", error); }
    finally { setLoading(false); }
  };

  const togglePublish = async (table: "vlogs" | "events" | "activities", id: string, currentState: boolean) => {
    const { error } = await supabase.from(table).update({ is_published: !currentState }).eq("id", id);
    if (error) { toast({ title: "Error", description: "Failed to update publish status.", variant: "destructive" }); }
    else { toast({ title: currentState ? "Unpublished" : "Published" }); fetchContent(); }
  };

  const handleDelete = async (table: "vlogs" | "events" | "activities", id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast({ title: "Error", description: "Failed to delete content.", variant: "destructive" }); }
    else { toast({ title: "Deleted", description: `"${title}" has been deleted.` }); fetchContent(); }
  };

  const renderContentList = (items: any[], pagination: ReturnType<typeof usePagination>, table: "vlogs" | "events" | "activities", renderExtra?: (item: any) => React.ReactNode) => (
    items.length === 0 ? (
      <p className="text-muted-foreground text-center py-8">No {table} yet</p>
    ) : (
      <>
        <div className="space-y-3">
          {pagination.paginatedItems.map((item: any) => (
            <div key={item.id} className="p-4 bg-secondary/50 rounded-xl flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {table === "activities" && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.activity_type || "General"}</span>}
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${item.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                {renderExtra?.(item)}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => togglePublish(table, item.id, item.is_published ?? true)}>
                  {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(table, item.id, item.title)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <ShowMoreButton hasMore={pagination.hasMore} onClick={pagination.showMore} totalCount={items.length} shownCount={pagination.paginatedItems.length} />
      </>
    )
  );

  return (
    <>
      <Tabs defaultValue="vlogs" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="vlogs">Vlogs ({vlogs.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vlogs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Video className="w-5 h-5 text-primary" />Vlogs</CardTitle>
              <Button variant="warm" size="sm" onClick={() => setIsVlogModalOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Vlog</Button>
            </CardHeader>
            <CardContent>
              {renderContentList(vlogs, vlogPagination, "vlogs", (vlog) => (
                <a href={vlog.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{vlog.youtube_url}</a>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Events</CardTitle>
              <Button variant="warm" size="sm" onClick={() => setIsEventModalOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Event</Button>
            </CardHeader>
            <CardContent>
              {renderContentList(events, eventPagination, "events", (event) => (
                <p className="text-xs text-primary mt-1">
                  {new Date(event.event_date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {event.location && ` • ${event.location}`}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Activities</CardTitle>
              <Button variant="warm" size="sm" onClick={() => setIsActivityModalOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Activity</Button>
            </CardHeader>
            <CardContent>{renderContentList(activities, activityPagination, "activities")}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddVlogModal isOpen={isVlogModalOpen} onClose={() => setIsVlogModalOpen(false)} onSuccess={fetchContent} />
      <AddEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSuccess={fetchContent} />
      <AddActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} onSuccess={fetchContent} />
    </>
  );
}
