export type User = {
  id: string;
  username: string;
};

export type Message = {
  id: string;
  group: string;
  sender: User;
  content: string;
  created_at: string; // ISO
};
