export type User = {
  id: string;
  name: string;
  email: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Comment = {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  createdAt: Date;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  createdAt: Date;
  updatedAt: Date;
};