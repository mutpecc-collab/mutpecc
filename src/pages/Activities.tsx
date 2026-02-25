import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, BookOpen, Users, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

const getActivityIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "workshop": return BookOpen;
    case "group session": case "support group": return Users;
    case "meditation": return Heart;
    default: return Sparkles;
  }
};

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { paginatedItems, hasMore, showMore } = usePagination(activities, 10);

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase.from("activities").select("*").eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setActivities(data);
    } catch (error) { console.error("Error fetching activities:", error); }
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
              <Sparkles className="w-4 h-4" />Community Activities
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Grow through <span className="text-primary">daily activities</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Simple, meaningful activities designed to support your mental wellness and connect you with our community.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Loading activities...</p></div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Activities Yet</h3>
              <p className="text-muted-foreground">Check back soon for new activities and challenges!</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {paginatedItems.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.activity_type);
                  return (
                    <motion.article key={activity.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (index % 10) * 0.1 }} className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-300">
                      {activity.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl gradient-sage flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-7 h-7 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">{activity.activity_type || "General"}</span>
                            <h3 className="text-xl font-serif font-semibold text-foreground mt-1 mb-2">{activity.title}</h3>
                            {activity.description && <p className="text-muted-foreground text-sm leading-relaxed">{activity.description}</p>}
                            {activity.activity_date && (
                              <div className="flex items-center gap-1.5 text-xs text-primary mt-3">
                                <Calendar className="w-3 h-3" />
                                {new Date(activity.activity_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
              <ShowMoreButton hasMore={hasMore} onClick={showMore} totalCount={activities.length} shownCount={paginatedItems.length} />
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Activities;
