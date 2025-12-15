import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Network, 
  Brain, 
  Heart, 
  ArrowRight,
  Sparkles,
  ScanText,
  RotateCcw,
  BookOpen
} from 'lucide-react';
// If you don't have a Button component, use a standard <button> with Tailwind classes
// import { Button } from "@/components/ui/button"; 

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the main app (Notes page)
    // If you have authentication logic, this route can handle the redirect if not logged in.
    navigate('/notes');
  };

  const steps = [
    {
      icon: FileText,
      title: "Create Notes",
      description: "Capture your thoughts instantly with powerful OCR support for images and documents.",
      step: 1,
    },
    {
      icon: Network,
      title: "Build Concept Maps",
      description: "Visualize connections between ideas and create meaningful knowledge networks.",
      step: 2,
    },
    {
      icon: Brain,
      title: "Review with Flashcards",
      description: "Master your content using science-backed spaced repetition techniques.",
      step: 3,
    },
    {
      icon: Heart,
      title: "Track Gratitude",
      description: "Reflect daily and cultivate positivity through mindful journaling.",
      step: 4,
    },
  ];

  const features = [
    {
      icon: ScanText,
      title: "Smart Notes",
      description: "OCR-powered note-taking that extracts text from images and documents automatically.",
    },
    {
      icon: Network,
      title: "Concept Maps",
      description: "Build visual knowledge graphs to see how your ideas connect and evolve.",
    },
    {
      icon: RotateCcw,
      title: "Spaced Repetition",
      description: "Scientifically proven method to retain information longer with less effort.",
    },
    {
      icon: BookOpen,
      title: "Gratitude Journal",
      description: "Daily reflection prompts to boost happiness and mental well-being.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Map My Notes</span>
          </div>
          <button 
            onClick={handleGetStarted}
            className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition flex items-center group"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Decorative gradient blobs (Simplified for standard CSS/Tailwind) */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-200 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-yellow-200 blur-3xl opacity-50" />

        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Master Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Knowledge</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 sm:text-xl">
              Organize your thoughts, build meaningful connections, and retain information effortlessly. 
              Map My Notes combines smart note-taking, visual concept maps, spaced repetition, 
              and gratitude journaling in one powerful app.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg shadow-purple-200 transition-all hover:shadow-xl hover:shadow-purple-300 flex items-center mx-auto group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-gray-100 bg-gray-50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              A simple four-step process to transform how you learn and retain information.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-gray-200">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Everything you need to capture, organize, and master your knowledge.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-purple-200">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to Transform Your Learning?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-600">
            Join thousands of learners who are already mastering their knowledge with Map My Notes.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg shadow-purple-200 transition-all hover:shadow-xl hover:shadow-purple-300 flex items-center mx-auto group"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Map My Notes</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="transition-colors hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                Terms of Service
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                Contact
              </a>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Map My Notes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
