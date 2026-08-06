export type ConversationsCopy = {
  title: string;
  description: string;
  inbox: string;
  conversations: string;
  emptyTitle: string;
  emptyDescription: string;
  noConversationsTitle: string;
  noConversationsDescription: string;
  selectTitle: string;
  selectDescription: string;
  fallbackTitle: string;
  noPreview: string;
  noMessages: string;
  messages: string;
  employee: string;
  contact: string;
  anonymous: string;
  leadScore: string;
  sentiment: string;
  searchPlaceholder: string;
  searchButton: string;
  all: string;
  open: string;
  closed: string;
  allEmployees: string;
  allChannels: string;
  clearFilters: string;
  filters: string;
};

const ukrainianCopy: ConversationsCopy = {
  title: "Розмови",
  description:
    "Усі діалоги клієнтів в одному робочому просторі.",
  inbox: "Вхідні",
  conversations: "розмов",
  emptyTitle: "Розмов не знайдено",
  emptyDescription:
    "Спробуйте змінити пошук або активні фільтри.",
  noConversationsTitle:
    "Розмов поки немає",
  noConversationsDescription:
    "Нові діалоги з Website Chat та підключених каналів з’являтимуться тут.",
  selectTitle: "Виберіть розмову",
  selectDescription:
    "Оберіть діалог зі списку, щоб переглянути повідомлення.",
  fallbackTitle: "Нова розмова",
  noPreview: "Повідомлень поки немає.",
  noMessages:
    "У цій розмові поки немає повідомлень.",
  messages: "повідомлень",
  employee: "ШІ-співробітник",
  contact: "Контакт",
  anonymous: "Анонімний відвідувач",
  leadScore: "Оцінка ліда",
  sentiment: "Настрій",
  searchPlaceholder: "Пошук розмов...",
  searchButton: "Знайти",
  all: "Усі",
  open: "Відкриті",
  closed: "Закриті",
  allEmployees: "Усі ШІ-співробітники",
  allChannels: "Усі канали",
  clearFilters: "Очистити",
  filters: "Фільтри",
};

const englishCopy: ConversationsCopy = {
  title: "Conversations",
  description:
    "All customer conversations in one workspace.",
  inbox: "Inbox",
  conversations: "conversations",
  emptyTitle: "No conversations found",
  emptyDescription:
    "Try changing your search or active filters.",
  noConversationsTitle:
    "No conversations yet",
  noConversationsDescription:
    "New conversations from Website Chat and connected channels will appear here.",
  selectTitle: "Select a conversation",
  selectDescription:
    "Choose a conversation from the list to view its messages.",
  fallbackTitle: "New conversation",
  noPreview: "No messages yet.",
  noMessages:
    "This conversation does not contain messages yet.",
  messages: "messages",
  employee: "AI Employee",
  contact: "Contact",
  anonymous: "Anonymous visitor",
  leadScore: "Lead score",
  sentiment: "Sentiment",
  searchPlaceholder:
    "Search conversations...",
  searchButton: "Search",
  all: "All",
  open: "Open",
  closed: "Closed",
  allEmployees: "All AI Employees",
  allChannels: "All channels",
  clearFilters: "Clear",
  filters: "Filters",
};

export function getConversationsCopy(
  locale: string,
): ConversationsCopy {
  return locale === "uk"
    ? ukrainianCopy
    : englishCopy;
}
