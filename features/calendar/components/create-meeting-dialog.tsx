"use client";

import {
  CalendarPlus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
  useTransition,
} from "react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMeetingAction } from "@/features/calendar/actions/create-meeting";
import type { MeetingLocationType } from "@/lib/generated/prisma/client";

type MeetingContactOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

type MeetingEmployeeOption = {
  id: string;
  name: string;
  role: string;
};

type CreateMeetingDialogProps = {
  locale: string;
  contacts: MeetingContactOption[];
  employees: MeetingEmployeeOption[];
};

type FieldErrors = Record<
  string,
  string[] | undefined
>;

function getDefaultStartDate(): string {
  const date = new Date();

  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  return toLocalDateTimeValue(date);
}

function getDefaultEndDate(): string {
  const date = new Date();

  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 2);

  return toLocalDateTimeValue(date);
}

function toLocalDateTimeValue(date: Date): string {
  const offset = date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() - offset * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
}

export function CreateMeetingDialog({
  locale,
  contacts,
  employees,
}: CreateMeetingDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [locationType, setLocationType] =
    useState<MeetingLocationType>("ONLINE");

  const [contactId, setContactId] =
    useState("unassigned");

  const [employeeId, setEmployeeId] =
    useState("unassigned");

  const [startsAt, setStartsAt] = useState(
    getDefaultStartDate,
  );

  const [endsAt, setEndsAt] = useState(
    getDefaultEndDate,
  );

  const [error, setError] = useState<string | null>(
    null,
  );

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [isPending, startTransition] =
    useTransition();

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        trigger: "Нова зустріч",
        title: "Створити зустріч",
        description:
          "Заплануйте дзвінок, онлайн-зустріч або особисту зустріч із клієнтом.",

        titleLabel: "Назва",
        titlePlaceholder:
          "Наприклад: Демонстрація Sellora",

        descriptionLabel: "Опис",
        descriptionPlaceholder:
          "Додайте порядок денний або важливі деталі...",

        contactLabel: "Контакт",
        noContact: "Без контакту",
        anonymous: "Анонімний контакт",

        employeeLabel: "AI-співробітник",
        noEmployee: "Не призначено",

        startsAtLabel: "Початок",
        endsAtLabel: "Завершення",

        locationTypeLabel: "Формат зустрічі",
        online: "Онлайн",
        phone: "Телефон",
        inPerson: "Особиста зустріч",

        locationUrlLabel: "Посилання на зустріч",
        locationUrlPlaceholder:
          "https://meet.google.com/...",

        phoneNumberLabel: "Номер телефону",
        phoneNumberPlaceholder: "+380...",

        addressLabel: "Адреса",
        addressPlaceholder:
          "Місто, вулиця, офіс",

        reminderLabel: "Нагадування",
        reminderHint:
          "Необов’язково. Нагадування має бути раніше початку зустрічі.",

        cancel: "Скасувати",
        create: "Створити зустріч",
        creating: "Створення...",

        fallbackError:
          "Не вдалося створити зустріч.",
      }
    : {
        trigger: "New meeting",
        title: "Create meeting",
        description:
          "Schedule a call, online meeting or in-person meeting with a customer.",

        titleLabel: "Title",
        titlePlaceholder:
          "Example: Sellora product demo",

        descriptionLabel: "Description",
        descriptionPlaceholder:
          "Add an agenda or important details...",

        contactLabel: "Contact",
        noContact: "No contact",
        anonymous: "Anonymous contact",

        employeeLabel: "AI Employee",
        noEmployee: "Unassigned",

        startsAtLabel: "Starts at",
        endsAtLabel: "Ends at",

        locationTypeLabel: "Meeting format",
        online: "Online",
        phone: "Phone",
        inPerson: "In person",

        locationUrlLabel: "Meeting link",
        locationUrlPlaceholder:
          "https://meet.google.com/...",

        phoneNumberLabel: "Phone number",
        phoneNumberPlaceholder: "+1...",

        addressLabel: "Address",
        addressPlaceholder:
          "City, street, office",

        reminderLabel: "Reminder",
        reminderHint:
          "Optional. The reminder must be earlier than the meeting start.",

        cancel: "Cancel",
        create: "Create meeting",
        creating: "Creating...",

        fallbackError: "Failed to create meeting.",
      };

  function resetForm(): void {
    setLocationType("ONLINE");
    setContactId("unassigned");
    setEmployeeId("unassigned");
    setStartsAt(getDefaultStartDate());
    setEndsAt(getDefaultEndDate());
    setError(null);
    setFieldErrors({});
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    setError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(
      formData.get("title") ?? "",
    ).trim();

    const description = String(
      formData.get("description") ?? "",
    ).trim();

    const locationUrl = String(
      formData.get("locationUrl") ?? "",
    ).trim();

    const locationAddress = String(
      formData.get("locationAddress") ?? "",
    ).trim();

    const phoneNumber = String(
      formData.get("phoneNumber") ?? "",
    ).trim();

    const reminderAt = String(
      formData.get("reminderAt") ?? "",
    ).trim();

    startTransition(async () => {
      const result = await createMeetingAction({
        title,
        description: description || null,
        contactId:
          contactId === "unassigned"
            ? null
            : contactId,
        employeeId:
          employeeId === "unassigned"
            ? null
            : employeeId,
        locationType,
        locationUrl:
          locationType === "ONLINE"
            ? locationUrl || null
            : null,
        locationAddress:
          locationType === "IN_PERSON"
            ? locationAddress || null
            : null,
        phoneNumber:
          locationType === "PHONE"
            ? phoneNumber || null
            : null,
        startsAt,
        endsAt,
        reminderAt: reminderAt || null,
        locale,
      });

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});

        const firstFieldError = result.fieldErrors
          ? Object.values(result.fieldErrors)
              .flat()
              .find(
                (message): message is string =>
                  typeof message === "string",
              )
          : undefined;

        setError(
          firstFieldError ??
            result.error ??
            copy.fallbackError,
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
        <CalendarPlus className="size-4" />
        {copy.trigger}
      </Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{copy.title}</DialogTitle>

              <DialogDescription>
                {copy.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="meeting-title">
                  {copy.titleLabel}
                </Label>

                <Input
                  id="meeting-title"
                  name="title"
                  placeholder={copy.titlePlaceholder}
                  maxLength={200}
                  required
                  autoFocus
                  disabled={isPending}
                  aria-invalid={
                    Boolean(fieldErrors.title?.length)
                  }
                />

                <FieldError
                  messages={fieldErrors.title}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-description">
                  {copy.descriptionLabel}
                </Label>

                <Textarea
                  id="meeting-description"
                  name="description"
                  placeholder={
                    copy.descriptionPlaceholder
                  }
                  rows={4}
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    {copy.contactLabel}
                  </Label>

                  <Select
                    value={contactId}
                    disabled={isPending}
                    onValueChange={(value) => {
                      setContactId(
                        value ?? "unassigned",
                      );
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="unassigned">
                        {copy.noContact}
                      </SelectItem>

                      {contacts.map((contact) => (
                        <SelectItem
                          key={contact.id}
                          value={contact.id}
                        >
                          {getContactName(
                            contact,
                            copy.anonymous,
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {copy.employeeLabel}
                  </Label>

                  <Select
                    value={employeeId}
                    disabled={isPending}
                    onValueChange={(value) => {
                      setEmployeeId(
                        value ?? "unassigned",
                      );
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="unassigned">
                        {copy.noEmployee}
                      </SelectItem>

                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name} ·{" "}
                          {employee.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meeting-starts-at">
                    {copy.startsAtLabel}
                  </Label>

                  <Input
                    id="meeting-starts-at"
                    name="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    required
                    disabled={isPending}
                    aria-invalid={
                      Boolean(
                        fieldErrors.startsAt?.length,
                      )
                    }
                    onChange={(event) =>
                      setStartsAt(event.target.value)
                    }
                  />

                  <FieldError
                    messages={fieldErrors.startsAt}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-ends-at">
                    {copy.endsAtLabel}
                  </Label>

                  <Input
                    id="meeting-ends-at"
                    name="endsAt"
                    type="datetime-local"
                    value={endsAt}
                    required
                    disabled={isPending}
                    aria-invalid={
                      Boolean(fieldErrors.endsAt?.length)
                    }
                    onChange={(event) =>
                      setEndsAt(event.target.value)
                    }
                  />

                  <FieldError
                    messages={fieldErrors.endsAt}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {copy.locationTypeLabel}
                </Label>

                <Select
                  value={locationType}
                  disabled={isPending}
                  onValueChange={(value) =>
                    setLocationType(
                      value as MeetingLocationType,
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ONLINE">
                      {copy.online}
                    </SelectItem>

                    <SelectItem value="PHONE">
                      {copy.phone}
                    </SelectItem>

                    <SelectItem value="IN_PERSON">
                      {copy.inPerson}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {locationType === "ONLINE" ? (
                <div className="space-y-2">
                  <Label htmlFor="meeting-location-url">
                    {copy.locationUrlLabel}
                  </Label>

                  <Input
                    id="meeting-location-url"
                    name="locationUrl"
                    type="url"
                    placeholder={
                      copy.locationUrlPlaceholder
                    }
                    disabled={isPending}
                    aria-invalid={
                      Boolean(
                        fieldErrors.locationUrl
                          ?.length,
                      )
                    }
                  />

                  <FieldError
                    messages={
                      fieldErrors.locationUrl
                    }
                  />
                </div>
              ) : null}

              {locationType === "PHONE" ? (
                <div className="space-y-2">
                  <Label htmlFor="meeting-phone-number">
                    {copy.phoneNumberLabel}
                  </Label>

                  <Input
                    id="meeting-phone-number"
                    name="phoneNumber"
                    type="tel"
                    placeholder={
                      copy.phoneNumberPlaceholder
                    }
                    disabled={isPending}
                  />
                </div>
              ) : null}

              {locationType === "IN_PERSON" ? (
                <div className="space-y-2">
                  <Label htmlFor="meeting-address">
                    {copy.addressLabel}
                  </Label>

                  <Input
                    id="meeting-address"
                    name="locationAddress"
                    placeholder={copy.addressPlaceholder}
                    disabled={isPending}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="meeting-reminder-at">
                  {copy.reminderLabel}
                </Label>

                <Input
                  id="meeting-reminder-at"
                  name="reminderAt"
                  type="datetime-local"
                  disabled={isPending}
                  aria-invalid={
                    Boolean(
                      fieldErrors.reminderAt?.length,
                    )
                  }
                />

                <p className="text-xs leading-5 text-muted-foreground">
                  {copy.reminderHint}
                </p>

                <FieldError
                  messages={fieldErrors.reminderAt}
                />
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
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                {copy.cancel}
              </Button>

              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CalendarPlus className="size-4" />
                )}

                {isPending
                  ? copy.creating
                  : copy.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

type FieldErrorProps = {
  messages?: string[];
};

function FieldError({
  messages,
}: FieldErrorProps) {
  const message = messages?.[0];

  if (!message) {
    return null;
  }

  return (
    <p className="text-xs text-destructive">
      {message}
    </p>
  );
}

function getContactName(
  contact: MeetingContactOption,
  anonymousLabel: string,
): string {
  const fullName = [
    contact.firstName,
    contact.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    contact.email ||
    anonymousLabel
  );
}
