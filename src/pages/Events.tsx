import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { paginatedItems, hasMore, showMore } = usePagination(events, 10);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").eq("is_published", true).gte("event_date", new Date().toISOString()).order("event_date", { ascending: true });
      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) { console.error("Error fetching events:", error); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FloatingButtons />

      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />Upcoming Events
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Join our <span className="text-primary">community events</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Workshops, support circles, and training sessions to support your mental wellness journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              <div className="text-center py-12"><p className="text-muted-foreground">Loading events...</p></div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">Check back soon for new events and activities!</p>
              </div>
            ) : (
              <>
                {paginatedItems.map((event, index) => (
                  <motion.article key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (index % 10) * 0.1 }} className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row">
                      {event.image_url && (
                        <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-shrink-0 w-20 h-20 rounded-xl gradient-sage flex flex-col items-center justify-center text-primary-foreground">
                            <span className="text-2xl font-bold">{new Date(event.event_date).getDate()}</span>
                            <span className="text-sm opacity-80">{new Date(event.event_date).toLocaleDateString("en-US", { month: "short" })}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{event.title}</h3>
                            {event.description && <p className="text-muted-foreground text-sm leading-relaxed mb-4">{event.description}</p>}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {new Date(event.event_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" />{event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
                <ShowMoreButton hasMore={hasMore} onClick={showMore} totalCount={events.length} shownCount={paginatedItems.length} />
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
