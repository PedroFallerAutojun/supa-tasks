import { createFileRoute } from "@tanstack/react-router";
import { TodoApp } from "@/components/TodoApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "To-Do List | Suas tarefas, organizadas" },
      { name: "description", content: "Lista de tarefas moderna com persistência em nuvem. Adicione, marque e exclua tarefas de qualquer lugar." },
    ],
  }),
  component: TodoApp,
});
