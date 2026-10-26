export type User = {
  id: string;
  nickname: string;
  phone: string;
  bio: string;
};

export type Message = {
  id: string;
  userId: string;
  author: string;
  text: string;
  createdAt: string;
};
