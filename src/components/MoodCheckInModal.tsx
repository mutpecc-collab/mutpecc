import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type MoodType = Database["public"]["Enums"]["mood_type"];

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feelingOptions = [
  { value: "happy", label: "Okay", emoji: "😊" },
  { value: "hopeful", label: "Happy", emoji: "🌟" },
  { value: "stressed", label: "Overwhelmed", emoji: "😫" },
  { value: "neutral", label: "Numb", emoji: "😐" },
  { value: "sad", label: "Very Low", emoji: "😢" },
];

const bodyOptions = [
  { value: "relaxed", label: "Relaxed" },
  { value: "tense", label: "Tense" },
  { value: "tired", label: "Tired" },
  { value: "restless", label: "Restless" },
  { value: "heavy", label: "Heavy" },
  { value: "not_sure", label: "Not sure" },
];

const thoughtOptions = [
  { value: "mostly_positive", label: "Mostly positive" },
  { value: "mixed", label: "Mix of good & bad" },
  { value: "heavy", label: "Heavy" },
  { value: "quiet", label: "Quiet" },
];

const needOptions = [
  { value: "someone_to_listen", label: "Someone to listen" },
  { value: "encouragement", label: "Encouragement" },
  { value: "understanding", label: "Understanding" },
  { value: "dont_know", label: "I don't know yet" },
];

export function MoodCheckInModal({ isOpen, onClose }: MoodCheckInModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [selectedThought, setSelectedThought] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [oneWord, setOneWord] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMoodType = (): MoodType => {
    const moodMap: Record<string, MoodType> = {
      happy: "happy",
      hopeful: "hopeful",
      stressed: "stressed",
      neutral: "neutral",
      sad: "sad",
    };
    return moodMap[selectedFeeling || "neutral"] || "neutral";
  };

  const handleSubmit = async () => {
    if (!selectedFeeling || !name || !email || !phone) return;
    setIsSubmitting(true);

    const feelings = [
      `Body: ${selectedBody || "Not specified"}`,
      `Thoughts: ${selectedThought || "Not specified"}`,
      `Need: ${selectedNeed || "Not specified"}`,
      `One word: ${oneWord || "Not specified"}`,
    ].join(" | ");

    const { error } = await supabase.from("mood_forms").insert({
      mood: getMoodType(),
      feelings,
      cause: null,
      proposed_solution: null,
      name,
      phone,
      email,
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Thank you!", description: "A counselor will reach out to you soon." });
      onClose();
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedFeeling !== null;
    if (step === 2) return selectedBody !== null;
    if (step === 3) return selectedThought !== null;
    if (step === 4) return selectedNeed !== null;
    if (step === 5) return oneWord.trim().length > 0;
    if (step === 6) return name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                Hi there 👋
              </h3>
              <p className="text-muted-foreground">
                How are you feeling right now?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {feelingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFeeling(option.value)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    "bg-secondary/50 hover:bg-secondary border-border",
                    selectedFeeling === option.value
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                Which best describes your body right now?
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bodyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedBody(option.value)}
                  className={cn(
                    "flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                    "bg-secondary/50 hover:bg-secondary border-border",
                    selectedBody === option.value
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "hover:border-primary/50"
                  )}
                >
                  <span className="font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                What were your thoughts like today?
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {thoughtOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedThought(option.value)}
                  className={cn(
                    "flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                    "bg-secondary/50 hover:bg-secondary border-border",
                    selectedThought === option.value
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "hover:border-primary/50"
                  )}
                >
                  <span className="font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                What do you need most right now?
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {needOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedNeed(option.value)}
                  className={cn(
                    "flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                    "bg-secondary/50 hover:bg-secondary border-border",
                    selectedNeed === option.value
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "hover:border-primary/50"
                  )}
                >
                  <span className="font-medium text-foreground text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                If you were to describe today in one word, what would it be?
              </h3>
            </div>
            <input
              type="text"
              value={oneWord}
              onChange={(e) => setOneWord(e.target.value)}
              placeholder="One word..."
              className="w-full p-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg"
            />
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                How can we reach you?
              </h3>
              <p className="text-muted-foreground">
                So our counselors can connect with you
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full p-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full p-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card rounded-2xl shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Confidentiality Banner */}
              <div className="flex items-center gap-2 px-4 py-2 bg-sage-50 rounded-lg mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  Your data is encrypted and 100% confidential
                </span>
              </div>

              {/* Progress */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "flex-1 h-1.5 rounded-full transition-colors duration-300",
                      s <= step ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 min-h-[320px]">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Skip to Homepage
              </Button>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="px-6"
                >
                  Back
                </Button>
              )}
              <Button
                variant="hero"
                onClick={() => {
                  if (step < 6) {
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!canProceed() || isSubmitting}
                className="flex-1"
              >
                {step === 6 ? (
                  <>
                    <Heart className="w-4 h-4" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
