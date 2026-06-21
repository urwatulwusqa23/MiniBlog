export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
}

export interface Tweet {
  id: number;
  userId: number;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface TweetViewModel {
  tweet: Tweet;
  user: User | null;
  isFollowing: boolean;
  isLiked: boolean;
}

export interface Comment {
  id: number;
  tweetId: number;
  userId: number;
  content: string;
  createdAt: string;
  username?: string;
  userAvatar?: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'Like' | 'Comment' | 'Follow' | 'Message' | string;
  timestamp: string;
  isRead: boolean;
}

export interface AuthState {
  userId: number | null;
  username: string | null;
  profilePicture: string | null;
  isLoggedIn: boolean;
}

export interface Contact {
  id: number;
  username: string;
  profilePicture: string;
}
