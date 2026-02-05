import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Calendar, LogIn, UserPlus, Shield, Sparkles, Users, Clock, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { MoodCheckInModal } from "@/components/MoodCheckInModal";
import { QuickBookModal } from "@/components/QuickBookModal";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import mentalHealthSupport from "@/assets/mental-health-support.jpg";
import mentalWellnessMeditation from "@/assets/mental-wellness-meditation.jpg";
import counselingSession from "@/assets/counseling-session.jpg";
import actionBookSession from "@/assets/action-book-session.jpg";
import actionMemberLogin from "@/assets/action-member-login.jpg";
import actionMoodCheckin from "@/assets/action-mood-checkin.jpg";
import actionJoinCommunity from "@/assets/action-join-community.jpg";
const Index = () => {
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("mutpecc-mood-checked");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setShowMoodModal(true);
        sessionStorage.setItem("mutpecc-mood-checked", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  return <div className="min-h-screen bg-background">
      <Header />
      <FloatingButtons />
      <MoodCheckInModal isOpen={showMoodModal} onClose={() => setShowMoodModal(false)} />
      <QuickBookModal isOpen={showQuickBook} onClose={() => setShowQuickBook(false)} />

      {/* Hero & Main Actions */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 min-h-[90vh] flex items-center">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Calming background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Value Prop */}
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.7
          }}>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                Ready to start your healing journey?
              </span>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
                Professional support for your <span className="text-primary border-b-4 border-primary/20">mental peace.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Book a session with a certified counselor or join our supportive community today. Your privacy is 100% guaranteed.
              </p>
              
              
            </motion.div>

            {/* Right Side: Direct Action Cards */}
            <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.7,
            delay: 0.2
          }} className="grid gap-4 sm:grid-cols-2">
              {/* Primary Action: Book */}
              <motion.button 
                onClick={() => setShowQuickBook(true)} 
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex flex-col items-start p-6 rounded-2xl shadow-xl transition-all group text-left overflow-hidden min-h-[200px]"
              >
                <img src={actionBookSession} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 group-hover:from-primary/95 group-hover:via-primary/85 group-hover:to-primary/70 transition-all duration-300" />
                <div className="relative z-10 flex flex-col h-full text-primary-foreground">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Book a Session</h3>
                  <p className="text-sm opacity-90 mb-4">Talk to a professional counselor privately.</p>
                  <div className="mt-auto flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Quick Book <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>

              {/* Action: Log In */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/auth" className="relative flex flex-col items-start p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left overflow-hidden min-h-[200px] block">
                  <img src={actionMemberLogin} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/90 to-card/80" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Member Login</h3>
                    <p className="text-sm text-muted-foreground mb-4">Access your dashboard and past sessions.</p>
                    <div className="mt-auto flex items-center gap-2 text-primary font-semibold">
                      Sign In <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Action: Mood Check */}
              <motion.button 
                onClick={() => setShowMoodModal(true)} 
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex flex-col items-start p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left overflow-hidden min-h-[200px] group"
              >
                <img src={actionMoodCheckin} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/90 to-card/80" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Mood Check-in</h3>
                  <p className="text-sm text-muted-foreground mb-4">Not sure how you feel? Take a quick assessment.</p>
                  <div className="mt-auto flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    Start Check <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>

              {/* Action: Join */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/community" className="relative flex flex-col items-start p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left overflow-hidden min-h-[200px] block group">
                  <img src={actionJoinCommunity} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/90 to-secondary/80" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center mb-4">
                      <UserPlus className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Join Community</h3>
                    <p className="text-sm text-muted-foreground mb-4">Connect with our supportive community.</p>
                    <div className="mt-auto flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                      Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Mental Health Awareness Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
              <HandHeart className="w-4 h-4" />
              Your Mental Health Matters
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Together, We Heal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our community provides a safe space for support, healing, and growth. Connect with professionals who understand your journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Support Group Card */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.1
          }} className="group relative overflow-hidden rounded-2xl shadow-lg">
              <img src={mentalHealthSupport} alt="Mental health support group" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Community Support</span>
                </div>
                <h3 className="text-xl font-bold">Group Sessions</h3>
                <p className="text-sm opacity-90 mt-1">Connect with others who understand</p>
              </div>
            </motion.div>

            {/* Wellness Card */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="group relative overflow-hidden rounded-2xl shadow-lg">
              <img src={mentalWellnessMeditation} alt="Mental wellness and meditation" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">Self Care</span>
                </div>
                <h3 className="text-xl font-bold">Mindfulness & Peace</h3>
                <p className="text-sm opacity-90 mt-1">Find your inner calm and balance</p>
              </div>
            </motion.div>

            {/* Counseling Card */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.3
          }} className="group relative overflow-hidden rounded-2xl shadow-lg">
              <img src={counselingSession} alt="Professional counseling session" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Professional Help</span>
                </div>
                <h3 className="text-xl font-bold">One-on-One Counseling</h3>
                <p className="text-sm opacity-90 mt-1">Personalized support from experts</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section: Simple & Clean */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary/60" />
              <div>
                <p className="font-bold">Confidential</p>
                <p className="text-xs text-muted-foreground">End-to-end encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-primary/60" />
              <div>
                <p className="font-bold">Verified</p>
                <p className="text-xs text-muted-foreground">Certified Counselors</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-primary/60" />
              <div>
                <p className="font-bold">24/7 Support</p>
                <p className="text-xs text-muted-foreground">Always here for you</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HandHeart className="w-10 h-10 text-primary/60" />
              <div>
                <p className="font-bold">Compassionate</p>
                <p className="text-xs text-muted-foreground">Judgment-free zone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;