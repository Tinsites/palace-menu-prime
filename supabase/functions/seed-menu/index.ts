import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if data exists
    const { count } = await supabase.from("categories").select("*", { count: "exact", head: true });
    if (count && count > 0) {
      return new Response(JSON.stringify({ message: "Data already seeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const menuData = [
      {
        name: "Rice Dishes", sort_order: 1, status: "published",
        meals: [
          { name: "White Rice", price: 3500 }, { name: "Jollof Rice", price: 4500 },
          { name: "Fried Rice", price: 4500 }, { name: "Coconut Rice", price: 5000 },
          { name: "Basmati Rice", price: 5500 }, { name: "Caribbean Rice", price: 5500 },
          { name: "Pesto Rice", price: 5000 }, { name: "Turkey-in-Rice", price: 6500 },
          { name: "Chinese Stir-fry", price: 6000 }, { name: "Asun Rice", price: 7000 },
        ],
      },
      {
        name: "Proteins & Add-ons", sort_order: 2, status: "published",
        meals: [
          { name: "Sautéed Turkey", price: 4500 }, { name: "Sautéed Chicken", price: 4000 },
          { name: "Peppered Goat Meat", price: 5500 }, { name: "Fried Plantain", price: 3500 },
          { name: "Salad", price: 3500 }, { name: "Beef", price: 4000 },
          { name: "Wings", price: 5000 }, { name: "Beef Kebab", price: 5500 },
          { name: "Boiled Egg", price: 3500 }, { name: "Titus (in Sauce)", price: 4500 },
          { name: "Titus (Fried)", price: 4500 },
        ],
      },
      {
        name: "Local Dishes", sort_order: 3, status: "published",
        meals: [
          { name: "Catfish Pepper Soup", price: 6500 }, { name: "Goat Meat Pepper Soup", price: 6000 },
          { name: "Cow Tail Pepper Soup", price: 6500 }, { name: "Isi-Ewu", price: 7000 },
          { name: "Nkwobi", price: 7000 }, { name: "Abacha", price: 5000 },
          { name: "Porridge Beans", price: 4000 }, { name: "Porridge Yam", price: 4500 },
          { name: "White Beans", price: 3500 },
        ],
      },
      {
        name: "Soups & Swallow", sort_order: 4, status: "published",
        meals: [
          { name: "Bitter Leaf Soup", price: 5500 }, { name: "Vegetable Soup", price: 5000 },
          { name: "Oga Soup", price: 5500 }, { name: "Okro Soup", price: 5000 },
          { name: "Egusi Soup", price: 5500 }, { name: "Nsala (White Soup)", price: 6000 },
          { name: "Semovita", price: 3500 }, { name: "Fufu", price: 3500 },
          { name: "Garri", price: 3500 },
        ],
      },
    ];

    for (const cat of menuData) {
      const { data: catData, error: catError } = await supabase.from("categories").insert({
        name: cat.name, sort_order: cat.sort_order, status: cat.status,
      }).select().single();

      if (catError) throw catError;

      const meals = cat.meals.map((m, i) => ({
        category_id: catData.id, name: m.name, price: m.price,
        sort_order: i + 1, status: "published",
      }));

      const { error: mealError } = await supabase.from("meals").insert(meals);
      if (mealError) throw mealError;
    }

    return new Response(JSON.stringify({ message: "Menu seeded successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
