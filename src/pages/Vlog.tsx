import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Calendar, Video } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Vlog = Database["public"]["Tables"]["vlogs"]["Row"];

const extractVideoId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  return match ? match[1] : null;
};

const Vlog = () => {
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [loading, setLoading] = useState(true);
  const { paginatedItems, hasMore, showMore } = usePagination(vlogs, 10);

  useEffect(() => {
    fetchVlogs();
  }, []);

  const fetchVlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("vlogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setVlogs(data);
    } catch (error) {
      console.error("Error fetching vlogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FloatingButtons />

      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              MUTPECC Vlogs
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Wellness insights & <span className="text-primary">guidance</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Expert videos on mental health, personal growth, and emotional wellness 
              from our team of counselors and coaches.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vlogs Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading vlogs...</p>
            </div>
          ) : vlogs.length === 0 ? (
            <div className="text-center py-12 max-w-md mx-auto">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Vlogs Yet</h3>
              <p className="text-muted-foreground">
                Check back soon for wellness videos and insights!
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedItems.map((vlog, index) => {
                  const videoId = extractVideoId(vlog.youtube_url);
                  const thumbnailUrl = vlog.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

                  return (
                    <motion.article
                      key={vlog.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: (index % 10) * 0.1 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-300 group"
                    >
                      <a href={vlog.youtube_url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative aspect-video bg-muted">
                          {thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={vlog.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-elevated">
                              <Play className="w-6 h-6 text-primary-foreground ml-1" />
                            </div>
                          </div>
                        </div>
                      </a>
                      <div className="p-6">
                        <a href={vlog.youtube_url} target="_blank" rel="noopener noreferrer">
                          <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {vlog.title}
                          </h3>
                        </a>
                        {vlog.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                            {vlog.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(vlog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
              <ShowMoreButton hasMore={hasMore} onClick={showMore} totalCount={vlogs.length} shownCount={paginatedItems.length} />
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vlog;
