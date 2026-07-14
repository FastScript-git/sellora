"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Ban,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";

import { FormSaveBar } from "@/components/forms/form-save-bar";
import { FormSection } from "@/components/forms/form-section";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateInstructionsAction,
  type UpdateInstructionsActionState,
} from "@/features/ai-employees/actions/update-instructions";

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
  saving: string;
  saved: string;
};

type InstructionsFormProps = {
  employeeId: string;
  locale: string;
  initialValues: InstructionsFormValues;
  translations: InstructionsFormTranslations;
};

type InstructionFieldProps = {
  id: keyof InstructionsFormValues;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  error?: string;
  rows: number;
  disabled: boolean;
  onChange: (value: string) => void;
};

const MAX_FIELD_LENGTH = 4000;

const initialActionState: UpdateInstructionsActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

function areValuesEqual(
  first: InstructionsFormValues,
  second: InstructionsFormValues,
) {
  return (
    first.identity === second.identity &&
    first.goals === second.goals &&
    first.rules === second.rules &&
    first.responseStyle === second.responseStyle &&
    first.restrictions === second.restrictions
  );
}

export function InstructionsForm({
  employeeId,
  locale,
  initialValues,
  translations,
}: InstructionsFormProps) {
  const [values, setValues] =
    useState<InstructionsFormValues>(initialValues);

  const [savedValues, setSavedValues] =
    useState<InstructionsFormValues>(initialValues);

  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  );

  const valuesRef = useRef(values);

  const [state, formAction, isPending] = useActionState(
    updateInstructionsAction,
    initialActionState,
  );

  valuesRef.current = values;

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setSavedValues(valuesRef.current);
    setSuccessMessage(translations.saved);

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state, translations.saved]);

  const isDirty = useMemo(
    () => !areValuesEqual(values, savedValues),
    [values, savedValues],
  );

  const fieldErrors = state.fieldErrors ?? {};
  const errorMessage = !state.success ? state.message : null;

  function updateField(
    field: keyof InstructionsFormValues,
    value: string,
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function cancelChanges() {
    setValues(savedValues);
  }

  return (
    <>
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 top-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-emerald-500/30 bg-background/95 px-4 py-3 text-sm shadow-xl backdrop-blur"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="size-4 text-emerald-400" />
          </span>

          <span className="font-medium text-foreground">
            {successMessage}
          </span>
        </div>
      ) : null}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="employeeId" value={employeeId} />
        <input type="hidden" name="locale" value={locale} />

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        ) : null}

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
            error={fieldErrors.identity}
            onChange={(value) => updateField("identity", value)}
            rows={7}
            disabled={isPending}
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
            error={fieldErrors.goals}
            onChange={(value) => updateField("goals", value)}
            rows={7}
            disabled={isPending}
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
            error={fieldErrors.rules}
            onChange={(value) => updateField("rules", value)}
            rows={8}
            disabled={isPending}
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
            error={fieldErrors.responseStyle}
            onChange={(value) =>
              updateField("responseStyle", value)
            }
            rows={6}
            disabled={isPending}
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
            error={fieldErrors.restrictions}
            onChange={(value) =>
              updateField("restrictions", value)
            }
            rows={7}
            disabled={isPending}
          />
        </FormSection>

        <FormSaveBar
          dirty={isDirty}
          pending={isPending}
          onCancel={cancelChanges}
        />
      </form>
    </>
  );
}

function InstructionField({
  id,
  icon,
  label,
  placeholder,
  hint,
  value,
  error,
  rows,
  disabled,
  onChange,
}: InstructionFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id} className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </Label>

        {value.length > 0 ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {value.length}/{MAX_FIELD_LENGTH}
          </span>
        ) : null}
      </div>

      <Textarea
        id={id}
        name={id}
        value={value}
        rows={rows}
        maxLength={MAX_FIELD_LENGTH}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hintId}
        disabled={disabled}
        className="min-h-36 resize-y leading-6"
      />

      {error ? (
        <p
          id={errorId}
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : (
        <p
          id={hintId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  );
}