export type PostFields = {
  id?: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  // postDate: Date;
  createdAt:Date;
  updatedAt:Date;
  isDeleted: boolean

};

export type ProfileFields = {
  id: number;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
}