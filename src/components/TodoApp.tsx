import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

export function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }

  async function addTask(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title: value })
      .select()
      .single();
    if (!error && data) {
      setTasks((prev) => [data as Task, ...prev]);
      setTitle("");
    }
    setAdding(false);
  }

  async function toggleTask(task: Task) {
    const next = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t)));
    await supabase.from("tasks").update({ completed: next }).eq("id", task.id);
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
               style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <ListTodo className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
            Suas tarefas
          </h1>
          <p className="text-muted-foreground text-sm">
            {loading
              ? "Carregando…"
              : tasks.length === 0
              ? "Comece adicionando sua primeira tarefa"
              : `${remaining} pendente${remaining === 1 ? "" : "s"} de ${tasks.length}`}
          </p>
        </header>

        <form
          onSubmit={addTask}
          className="flex gap-2 p-2 rounded-2xl bg-card border border-border mb-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={adding || !title.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl font-medium text-sm text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: "var(--gradient-primary)" }}
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={3} />}
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </form>

        <ul className="space-y-2">
          {loading && (
            <li className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </li>
          )}

          {!loading && tasks.length === 0 && (
            <li className="text-center py-16 text-muted-foreground text-sm">
              Tudo limpo por aqui ✨
            </li>
          )}

          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card border border-border transition-all hover:border-primary/40"
            >
              <button
                onClick={() => toggleTask(task)}
                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={2} />
                ) : (
                  <Circle className="w-6 h-6" strokeWidth={2} />
                )}
              </button>
              <span
                className={`flex-1 text-base transition-all ${
                  task.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Excluir tarefa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
