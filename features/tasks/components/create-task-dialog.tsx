"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskAction } from "@/features/tasks/actions/create-task";

const priorityOptions = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
] as const;

type TaskPriority =
  (typeof priorityOptions)[number]["value"];

export function CreateTaskDialog() {
  const locale = useLocale();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setPriority("MEDIUM");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(
      formData.get("title") ?? "",
    ).trim();

    const description = String(
      formData.get("description") ?? "",
    ).trim();

    const dueAt = String(
      formData.get("dueAt") ?? "",
    ).trim();

    startTransition(async () => {
      const result = await createTaskAction({
        title,
        description: description || null,
        contactId: null,
        employeeId: null,
        priority,
        dueAt: dueAt || null,
        reminderAt: null,
        locale,
      });

      if (!result.success) {
        const titleError =
          result.fieldErrors?.title?.[0];

        setError(
          titleError ??
            result.error ??
            "Failed to create task.",
        );

        return;
      }

      form.reset();
      resetForm();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        New Task
      </Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                Create task
              </DialogTitle>

              <DialogDescription>
                Add a new task for your workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-5">
              <div className="space-y-2">
                <label
                  htmlFor="task-title"
                  className="text-sm font-medium"
                >
                  Title
                </label>

                <Input
                  id="task-title"
                  name="title"
                  placeholder="Call the customer"
                  maxLength={200}
                  required
                  autoFocus
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="task-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>

                <Textarea
                  id="task-description"
                  name="description"
                  placeholder="Add details about this task..."
                  rows={4}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="task-priority"
                  className="text-sm font-medium"
                >
                  Priority
                </label>

                <Select
                  value={priority}
                  onValueChange={(value) => {
                    setPriority(
                      value as TaskPriority,
                    );
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="task-priority"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="task-due-at"
                  className="text-sm font-medium"
                >
                  Due date
                </label>

                <Input
                  id="task-due-at"
                  name="dueAt"
                  type="datetime-local"
                  disabled={isPending}
                />

                <p className="text-xs text-muted-foreground">
                  Optional. Leave empty if this task has no
                  deadline.
                </p>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending
                  ? "Creating..."
                  : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}