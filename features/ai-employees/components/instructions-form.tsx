"use client";

import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  MessageSquareText,
  Save,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/forms/form-section";

type InstructionsFormValues = {
  identity: string;
  goals: string;
  rules: string;
  responseStyle: string;
  restrictions: string;
};

type InstructionsFormTranslations = {
  identity: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    hint: string;
  };
  goals: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    hint: string;
  };
  rules: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    hint: string;
  };
  responseStyle: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    hint: string;
  };
  restrictions: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    hint: string;
  };
  save: string;
  savingUnavailable: string;
};

type InstructionsFormProps = {
  initialValues: InstructionsFormValues;
  translations: InstructionsFormTranslations;
};

const MAX_FIELD_LENGTH = 4000;

export function InstructionsForm({
  initialValues,
  translations,
}: InstructionsFormProps) {
  const [values, setValues] = useState(initialValues);

  function updateField(
    field: keyof InstructionsFormValues,
    value: string,
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  return (
    <div className="space-y-6">
      <FormSection
        title={translations.identity.title}
        description={translations.identity.description}
      >
        <InstructionField
          id="identity"
          icon={<UserRound className="size-4" />}
          label={translations.identity.label}
          placeholder={translations.identity.placeholder}
          hint={translations.identity.hint}
          value={values.identity}
          onChange={(value) => updateField("identity", value)}
          rows={7}
        />
      </FormSection>

      <FormSection
        title={translations.goals.title}
        description={translations.goals.description}
      >
        <InstructionField
          id="goals"
          icon={<Target className="size-4" />}
          label={translations.goals.label}
          placeholder={translations.goals.placeholder}
          hint={translations.goals.hint}
          value={values.goals}
          onChange={(value) => updateField("goals", value)}
          rows={7}
        />
      </FormSection>

      <FormSection
        title={translations.rules.title}
        description={translations.rules.description}
      >
        <InstructionField
          id="rules"
          icon={<ShieldCheck className="size-4" />}
          label={translations.rules.label}
          placeholder={translations.rules.placeholder}
          hint={translations.rules.hint}
          value={values.rules}
          onChange={(value) => updateField("rules", value)}
          rows={8}
        />
      </FormSection>

      <FormSection
        title={translations.responseStyle.title}
        description={translations.responseStyle.description}
      >
        <InstructionField
          id="responseStyle"
          icon={<MessageSquareText className="size-4" />}
          label={translations.responseStyle.label}
          placeholder={translations.responseStyle.placeholder}
          hint={translations.responseStyle.hint}
          value={values.responseStyle}
          onChange={(value) => updateField("responseStyle", value)}
          rows={6}
        />
      </FormSection>

      <FormSection
        title={translations.restrictions.title}
        description={translations.restrictions.description}
      >
        <InstructionField
          id="restrictions"
          icon={<Ban className="size-4" />}
          label={translations.restrictions.label}
          placeholder={translations.restrictions.placeholder}
          hint={translations.restrictions.hint}
          value={values.restrictions}
          onChange={(value) => updateField("restrictions", value)}
          rows={7}
        />
      </FormSection>

      <div className="sticky bottom-4 z-20 rounded-xl border bg-background/90 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </span>

            <p className="text-xs leading-5 text-muted-foreground">
              {translations.savingUnavailable}
            </p>
          </div>

          <Button type="button" disabled>
            <Save className="size-4" />
            {translations.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

type InstructionFieldProps = {
  id: string;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
};

function InstructionField({
  id,
  icon,
  label,
  placeholder,
  hint,
  value,
  rows,
  onChange,
}: InstructionFieldProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id} className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </Label>

        <span className="text-xs tabular-nums text-muted-foreground">
          {value.length}/{MAX_FIELD_LENGTH}
        </span>
      </div>

      <Textarea
        id={id}
        name={id}
        value={value}
        rows={rows}
        maxLength={MAX_FIELD_LENGTH}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-36 resize-y leading-6"
      />

      <p className="text-xs leading-5 text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}