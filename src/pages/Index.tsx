import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import paloLogo from "@/assets/palo-logo.png";
import food1 from "@/assets/food-1.png";
import food2 from "@/assets/food-2.png";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import turkeyImg from "@/assets/turkey.jpg";
import nkwobiImg from "@/assets/nkwobi.png";

type Category = { id: string; name: string; sort_order: number };
type Meal = { id: string; category_id: string; name: string; price: number; image_url: string | null };

// Maps category index to its section image: 0=Rice(jollof), 1=Proteins(turkey), 2=Local(nkwobi), 3=Soups
const sectionImages = [food3, turkeyImg, nkwobiImg, food4];

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <img src={paloLogo} alt="Palo Place" className="h-14 w-auto" />
          <h1 className="text-xl font-bold tracking-wide text-primary md:text-2xl">Palo Place Menu</h1>
          <a
            href="https://www.instagram.com/paloplaceabuja/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Order Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(30 93% 54% / 0.3), transparent 60%)" }} />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="mb-3 text-4xl font-bold text-primary-foreground md:text-5xl">Our Menu</h2>
            <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-secondary" />
            <p className="text-lg text-primary-foreground/80">Premium Nigerian Dining Experience</p>
          </motion.div>
        </div>
      </section>

      {/* Category Nav */}
      <nav className="sticky top-[73px] z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4">
          <div className="flex gap-1 py-2">
            {categories.map((cat) => (
              <a key={cat.id} href={`#cat-${cat.id}`}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/10 hover:text-secondary">
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Menu Sections */}
      <main className="mx-auto max-w-5xl px-4 py-12">
        {categories.map((cat, catIdx) => {
          const catMeals = meals.filter((m) => m.category_id === cat.id);
          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-36">
              {/* Section image divider */}
              {catIdx > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                  className="my-12 overflow-hidden rounded-2xl shadow-xl">
                  <div className="group relative h-56 overflow-hidden md:h-72">
                    <img src={sectionImages[catIdx % sectionImages.length]} alt="Food" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="mb-8 mt-12">
                <h3 className="text-3xl font-bold text-primary md:text-4xl">{cat.name}</h3>
                <div className="mt-2 h-1 w-16 rounded-full bg-secondary" />
              </motion.div>

              <div className="grid gap-3 sm:grid-cols-2">
                {catMeals.map((meal, mealIdx) => (
                  <motion.div key={meal.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, delay: mealIdx * 0.05 }}
                    className="group flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all duration-300 hover:border-secondary/30 hover:shadow-md">
                    <span className="text-base font-medium text-card-foreground">{meal.name}</span>
                    <span className="ml-4 whitespace-nowrap rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                      {formatPrice(meal.price)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-primary py-10 text-center text-primary-foreground/70">
        <img src={paloLogo} alt="Palo Place" className="mx-auto mb-4 h-16 w-auto opacity-80" />
        <p className="text-sm">© {new Date().getFullYear()} Palo Place. All rights reserved.</p>
        <p className="mt-1 text-xs text-primary-foreground/50">Premium Nigerian Dining</p>
      </footer>
    </div>
  );
};

export default Index;
