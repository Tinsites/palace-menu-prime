import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil, Upload, LogOut, Send } from "lucide-react";
import * as XLSX from "xlsx";
import paloLogo from "@/assets/palo-logo.png";

type Category = { id: string; name: string; sort_order: number; status: string };
type Meal = { id: string; category_id: string; name: string; price: number; status: string; image_url: string | null };

const AdminDashboard = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dialog states
  const [catDialog, setCatDialog] = useState(false);
  const [mealDialog, setMealDialog] = useState(false);
  const [editMealDialog, setEditMealDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newMealName, setNewMealName] = useState("");
  const [newMealPrice, setNewMealPrice] = useState("");
  const [newMealCat, setNewMealCat] = useState("");
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchData = useCallback(async () => {
    const [catRes, mealRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("meals").select("*").order("sort_order"),
    ]);
    setCategories(catRes.data || []);
    setMeals(mealRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("role", "admin");
      if (!roles || roles.length === 0) { navigate("/admin/login"); return; }
      fetchData();
    };
    checkAuth();
  }, [navigate, fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: newCatName.trim(), sort_order: categories.length + 1, status: "draft",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewCatName(""); setCatDialog(false); setHasChanges(true); fetchData();
    toast({ title: "Category added" });
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setHasChanges(true); fetchData();
    toast({ title: "Category deleted" });
  };

  const addMeal = async () => {
    if (!newMealName.trim() || !newMealCat || !newMealPrice) return;
    const catMeals = meals.filter(m => m.category_id === newMealCat);
    const { error } = await supabase.from("meals").insert({
      name: newMealName.trim(), price: parseInt(newMealPrice), category_id: newMealCat,
      sort_order: catMeals.length + 1, status: "draft",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewMealName(""); setNewMealPrice(""); setNewMealCat(""); setMealDialog(false); setHasChanges(true); fetchData();
    toast({ title: "Meal added" });
  };

  const openEditMeal = (meal: Meal) => {
    setEditingMeal(meal); setEditName(meal.name); setEditPrice(meal.price.toString()); setEditMealDialog(true);
  };

  const updateMeal = async () => {
    if (!editingMeal || !editName.trim() || !editPrice) return;
    const { error } = await supabase.from("meals").update({
      name: editName.trim(), price: parseInt(editPrice), status: "draft",
    }).eq("id", editingMeal.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setEditMealDialog(false); setHasChanges(true); fetchData();
    toast({ title: "Meal updated" });
  };

  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setHasChanges(true); fetchData();
    toast({ title: "Meal deleted" });
  };

  const publishAll = async () => {
    await Promise.all([
      supabase.from("categories").update({ status: "published" }).neq("status", "published"),
      supabase.from("meals").update({ status: "published" }).neq("status", "published"),
    ]);
    setHasChanges(false); fetchData();
    toast({ title: "Published!", description: "All changes are now live." });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{ category?: string; name?: string; price?: number }>(sheet);

    let count = 0;
    for (const row of rows) {
      if (!row.name || !row.category) continue;
      // Find or create category
      let cat = categories.find(c => c.name.toLowerCase() === row.category!.toLowerCase());
      if (!cat) {
        const { data: newCat } = await supabase.from("categories").insert({
          name: row.category, sort_order: categories.length + 1, status: "draft",
        }).select().single();
        if (newCat) { cat = newCat as Category; setCategories(prev => [...prev, cat!]); }
      }
      if (!cat) continue;

      await supabase.from("meals").insert({
        name: row.name, price: row.price || 4000, category_id: cat.id, sort_order: 0, status: "draft",
      });
      count++;
    }
    setHasChanges(true); fetchData();
    toast({ title: `Imported ${count} meals from file` });
    e.target.value = "";
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={paloLogo} alt="Palo Place" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button onClick={publishAll} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Send className="mr-1 h-4 w-4" /> Publish Changes
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}><LogOut className="mr-1 h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button onClick={() => setCatDialog(true)}><Plus className="mr-1 h-4 w-4" /> Add Category</Button>
          <Button onClick={() => { setMealDialog(true); setNewMealCat(categories[0]?.id || ""); }}><Plus className="mr-1 h-4 w-4" /> Add Meal</Button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            <Upload className="h-4 w-4" /> Upload CSV/Excel
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Categories & Meals */}
        {categories.map((cat) => {
          const catMeals = meals.filter((m) => m.category_id === cat.id);
          return (
            <Card key={cat.id} className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{cat.name}</CardTitle>
                  {cat.status === "draft" && (
                    <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary">Draft</span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                {catMeals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No meals in this category.</p>
                ) : (
                  <div className="space-y-2">
                    {catMeals.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{meal.name}</span>
                          {meal.status === "draft" && (
                            <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-xs text-secondary">Draft</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-secondary">₦{meal.price.toLocaleString()}</span>
                          <Button variant="ghost" size="icon" onClick={() => openEditMeal(meal)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMeal(meal.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </main>

      {/* Add Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <Input placeholder="Category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
          <DialogFooter><Button onClick={addCategory}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Meal Dialog */}
      <Dialog open={mealDialog} onOpenChange={setMealDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Meal</DialogTitle></DialogHeader>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newMealCat} onChange={(e) => setNewMealCat(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Input placeholder="Meal name" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} />
          <Input placeholder="Price (e.g. 4500)" type="number" value={newMealPrice} onChange={(e) => setNewMealPrice(e.target.value)} />
          <DialogFooter><Button onClick={addMeal}>Add Meal</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Dialog */}
      <Dialog open={editMealDialog} onOpenChange={setEditMealDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Meal</DialogTitle></DialogHeader>
          <Input placeholder="Meal name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input placeholder="Price" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          <DialogFooter><Button onClick={updateMeal}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
