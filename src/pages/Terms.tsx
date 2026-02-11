import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { Shield, Target, Eye, Quote, Heart } from "lucide-react";

const coreValues = [
  "Teamwork",
  "Time management",
  "Responsibility",
  "Love",
  "Commitment",
  "Integrity",
  "Self-discipline",
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary/90 to-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-cover bg-center" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Shield className="w-14 h-14 text-primary-foreground/80 mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            MUTPECC Constitution
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            The Constitution of Murang'a University of Technology Peer Educators & Counselors Club
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">

          {/* Part One */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground border-b border-border pb-2">
              Part One
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This constitution is the supreme law of the MUTPECC and shall be referred to as
              "THE CONSTITUTION OF THE MURANG'A UNIVERSITY OF TECHNOLOGY PEER
              EDUCATORS/COUNSELORS CLUB" and shall apply to all members and Executive organs to the
              extent of the provisions stated herein.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Any rule, order, or provision that is inconsistent with this Constitution is void to the extent of the
              inconsistency.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">Mission</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To promote student growth and development, with regard to both personal characteristics and
              interpersonal competences.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">Vision</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A leading club that produces all round persons anchored on moral and emotional intelligence.
            </p>
          </div>

          {/* Motto */}
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center space-y-3">
            <Quote className="w-6 h-6 text-primary mx-auto" />
            <h3 className="font-serif text-xl font-semibold text-foreground">Motto</h3>
            <p className="text-lg italic text-primary font-medium">
              "Together we can transform the world"
            </p>
          </div>

          {/* Core Values */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">Core Values</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coreValues.map((value, i) => (
                <div
                  key={value}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
