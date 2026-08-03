export type UpdateWidgetSettingsState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<
    Record<
      | "isEnabled"
      | "widgetTitle"
      | "widgetGreeting"
      | "widgetPrimaryColor"
      | "widgetPosition"
      | "allowedDomains",
      string
    >
  >;
};

export const initialUpdateWidgetSettingsState: UpdateWidgetSettingsState = {
  success: false,
  message: null,
  fieldErrors: {},
};
