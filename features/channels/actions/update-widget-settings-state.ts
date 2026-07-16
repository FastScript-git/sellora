export type UpdateWidgetSettingsState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<
    Record<
      | "widgetTitle"
      | "widgetGreeting"
      | "widgetPrimaryColor"
      | "widgetPosition",
      string
    >
  >;
};

export const initialUpdateWidgetSettingsState: UpdateWidgetSettingsState = {
  success: false,
  message: null,
  fieldErrors: {},
};