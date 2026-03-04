import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Phone, Instagram, ChevronDown } from "lucide-react";
import paloLogo from "@/assets/palo-logo.png";
import food1 from "@/assets/food-1.png";
import food2 from "@/assets/food-2.png";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import turkeyImg from "@/assets/turkey.jpg";
import nkwobiImg from "@/assets/nkwobi.png";

type Category = { id: string; name: string; sort_order: number };
type Meal = { id: string; category_id: string; name: string; price: number; image_url: string | null };

const sectionImages = [food3, turkeyImg, nkwobiImg, food4];

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      const [catRes, mealRes] = await Promise.all([
        supabase.from("categories").select("id, name, sort_order").eq("status", "published").order("sort_order"),
        supabase.from("meals").select("id, category_id, name, price, image_url").eq("status", "published").order("sort_order"),
      ]);
      setCategories(catRes.data || []);
      setMeals(mealRes.data || []);
      setLoading(false);
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active category on scroll
  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("cat-", ""));
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="h-10 w-10 rounded-full border-[3px] border-secondary border-t-transparent"
          />
          <p className="text-sm font-medium text-muted-foreground">Loading menu…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ───── HEADER ───── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-border/40 bg-background/90 shadow-lg shadow-primary/5 backdrop-blur-xl"
            : "bg-background/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <motion.img
            src={paloLogo}
            alt="Palo Place"
            className="h-12 w-auto md:h-14"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          />
          <nav className="hidden items-center gap-6 md:flex">
            {categories.slice(0, 4).map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeCategory === cat.id
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </nav>
          <motion.a
            href="https://www.instagram.com/paloplaceabuja/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-secondary-foreground shadow-lg shadow-secondary/25 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Order Now</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.a>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-primary">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/30 bg-secondary/10 backdrop-blur-sm"
            >
              <MapPin className="h-7 w-7 text-secondary" />
            </motion.div>
            <h2 className="mb-4 text-5xl font-bold tracking-tight text-primary-foreground md:text-6xl lg:text-7xl">
              Our Menu
            </h2>
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary/60" />
            </div>
            <p className="mx-auto max-w-md text-lg font-light tracking-wide text-primary-foreground/70 md:text-xl">
              Premium Nigerian Dining Experience
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-12 flex justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-primary-foreground/30" />
          </motion.div>
        </div>
      </section>

      {/* ───── CATEGORY NAV (sticky) ───── */}
      <nav className="sticky top-[57px] z-40 border-b border-border/30 bg-background/95 backdrop-blur-xl md:top-[65px]">
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 scrollbar-hide">
          <div className="flex items-center gap-1 py-2.5">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className={`relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-secondary text-secondary-foreground shadow-md shadow-secondary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ───── MENU SECTIONS ───── */}
      <main className="mx-auto max-w-6xl px-5 py-16">
        {categories.map((cat, catIdx) => {
          const catMeals = meals.filter((m) => m.category_id === cat.id);
          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-36">
              {/* Section image divider */}
              {catIdx > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }}
                  className="my-16 overflow-hidden rounded-3xl shadow-2xl shadow-primary/10"
                >
                  <div className="group relative h-52 overflow-hidden md:h-72 lg:h-80">
                    <img
                      src={sectionImages[catIdx % sectionImages.length]}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                        Up Next
                      </p>
                      <p className="mt-1 text-2xl font-bold text-primary-foreground md:text-3xl">
                        {cat.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Category heading */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="mb-8 mt-14 flex items-end gap-4"
              >
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                    {String(catIdx + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
                    {cat.name}
                  </h3>
                </div>
                <div className="mb-2 h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </motion.div>

              {/* Meal cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {catMeals.map((meal, mealIdx) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: mealIdx * 0.04 }}
                    className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all duration-300 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5"
                  >
                    {/* Hover glow */}
                    <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-secondary/0 transition-all duration-500 group-hover:bg-secondary/5" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary/60 transition-colors group-hover:bg-secondary" />
                        <span className="text-base font-medium text-card-foreground transition-colors group-hover:text-foreground">
                          {meal.name}
                        </span>
                      </div>
                      <span className="ml-4 whitespace-nowrap rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-bold tabular-nums text-secondary transition-all group-hover:bg-secondary group-hover:text-secondary-foreground">
                        {formatPrice(meal.price)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* ───── FOOTER ───── */}
      <footer className="relative overflow-hidden border-t border-border bg-primary">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative mx-auto max-w-6xl px-5 py-14">
          <div className="flex flex-col items-center gap-6">
            <img src={paloLogo} alt="Palo Place" className="h-16 w-auto opacity-90" />
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary-foreground/20" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                Premium Nigerian Dining
              </p>
              <div className="h-px w-8 bg-primary-foreground/20" />
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/paloplaceabuja/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/60 transition-all duration-300 hover:border-secondary hover:text-secondary"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-primary-foreground/50">
                © {new Date().getFullYear()} Palo Place. All rights reserved.
              </p>
              <p className="mt-3 text-xs text-primary-foreground/30">
                Developed by{" "}
                <a
                  href="https://tinsites.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-secondary"
                >
                  Tinsites Web Solutions
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
