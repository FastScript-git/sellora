"use client";

import { useTranslations } from "next-intl";
import {
  useActionState,
  useState,
} from "react";
import {
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqSourceAction,
  type CreateFaqSourceState,
} from "@/features/knowledge/actions/create-faq-source";

type FaqSourceFormProps = {
  employeeId: string;
  locale: string;
  onSuccess?: () => void;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const initialState: CreateFaqSourceState = {
  success: false,
  message: null,
  fieldErrors: {},
};

const initialItems: FaqItem[] = [
  {
    id: "faq-item-1",
    question: "",
    answer: "",
  },
];

export function FaqSourceForm({
  employeeId,
  locale,
  onSuccess,
}: FaqSourceFormProps) {
  const t = useTranslations(
    "aiEmployeeKnowledge.forms.faq",
  );

  const [items, setItems] =
    useState<FaqItem[]>(initialItems);

  async function submitFaq(
    previousState: CreateFaqSourceState,
    formData: FormData,
  ) {
    const result =
      await createFaqSourceAction(
        previousState,
        formData,
      );

    if (result.success) {
      onSuccess?.();
    }

    return result;
  }

  const [state, formAction, isPending] =
    useActionState(
      submitFaq,
      initialState,
    );

  const fieldErrors =
    state.fieldErrors ?? {};

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter(
        (item) => item.id !== id,
      );
    });
  }

  function updateItem(
    id: string,
    field: "question" | "answer",
    value: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  const serializedItems = JSON.stringify(
    items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <input
        type="hidden"
        name="employeeId"
        value={employeeId}
      />

      <input
        type="hidden"
        name="locale"
        value={locale}
      />

      <input
        type="hidden"
        name="items"
        value={serializedItems}
      />

      {state.message ? (
        <div
          role="status"
          className={
            state.success
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
              : "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="faq-title">
          {t("title")}
        </Label>

        <Input
          id="faq-title"
          name="title"
          maxLength={120}
          placeholder={t("titlePlaceholder")}
          disabled={isPending}
          aria-invalid={Boolean(
            fieldErrors.title,
          )}
        />

        {fieldErrors.title ? (
          <p className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <section
            key={item.id}
            className="rounded-xl border bg-muted/10 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {t("item")} #{index + 1}
              </p>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={
                  isPending ||
                  items.length === 1
                }
                onClick={() =>
                  removeItem(item.id)
                }
              >
                <Trash2 className="size-4" />
                {t("removeItem")}
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <Label
                htmlFor={`faq-question-${item.id}`}
              >
                {t("question")}
              </Label>

              <Input
                id={`faq-question-${item.id}`}
                value={item.question}
                maxLength={500}
                placeholder={
                  t("questionPlaceholder")
                }
                disabled={isPending}
                onChange={(event) =>
                  updateItem(
                    item.id,
                    "question",
                    event.target.value,
                  )
                }
              />

              <p className="text-right text-xs tabular-nums text-muted-foreground">
                {item.question.length}/500
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <Label
                htmlFor={`faq-answer-${item.id}`}
              >
                {t("answer")}
              </Label>

              <Textarea
                id={`faq-answer-${item.id}`}
                value={item.answer}
                rows={5}
                maxLength={5_000}
                placeholder={
                  t("answerPlaceholder")
                }
                disabled={isPending}
                onChange={(event) =>
                  updateItem(
                    item.id,
                    "answer",
                    event.target.value,
                  )
                }
              />

              <p className="text-right text-xs tabular-nums text-muted-foreground">
                {item.answer.length}/5000
              </p>
            </div>
          </section>
        ))}

        {fieldErrors.items ? (
          <p className="text-xs text-destructive">
            {fieldErrors.items}
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={
            isPending ||
            items.length >= 100
          }
          onClick={addItem}
        >
          <Plus className="size-4" />
          {t("addItem")}
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}
