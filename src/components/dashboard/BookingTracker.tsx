import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Clock, CheckCircle2, Phone, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type QuickBooking = Database["public"]["Tables"]["quick_bookings"]["Row"];

export function BookingTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<QuickBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from("quick_bookings")
        .select("*")
        .or(`email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error searching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isContacted: boolean | null) => {
    if (isContacted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Contacted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Pending
      </span>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="w-5 h-5 text-primary" />
          Track Your Booking Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter your email or phone number..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No booking requests found with this email or phone.</p>
                <p className="text-sm mt-1">Make sure you entered the correct details.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-secondary/50 rounded-xl border border-border/50"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{booking.name}</h4>
                        {getStatusBadge(booking.is_contacted)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {booking.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {booking.phone}
                        </span>
                      </div>
                      {booking.message && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                          "{booking.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(booking.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  {booking.is_contacted && booking.contacted_at && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-sm text-green-600">
                        ✓ A counselor contacted you on {new Date(booking.contacted_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
