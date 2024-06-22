import { ProfileDbManager } from "../../database/profileDbManager";
import {PostFields, ProfileFields} from "../../types/profile"
export class ProfileManager<T>{
request: T;
profileDbManager : ProfileDbManager
constructor(request: T){
    this.request = request;
    this.profileDbManager  =new ProfileDbManager();
}
getPostsByUserId = async (userId: number): Promise<PostFields[]> => {
    try {
      const posts = await this.profileDbManager.getPostsByUserId(userId);
      console.log("post ekrana yazdırıldı: ",posts)
      return posts;
    } catch (error) {
      console.error("Error in fetching posts:", error);
      throw new Error("Error fetching posts");
    }
  };

  getUserProfile = async (userId: number): Promise<ProfileFields> => {
    try {
      const profile = await this.profileDbManager.getUserProfile(userId);
      console.log("User profile retrieved: ", profile);
      return profile;
    } catch (error) {
      console.error("Error in fetching user profile:", error);
      throw new Error("Error fetching user profile");
    }
  };
  getMainPosts = async(userId: number): Promise<PostFields[]> => {
    try {
      const posts = await this.profileDbManager.getMainPosts(userId);
      console.log("post ekrana yazdırıldı: ",posts)
      return posts;
    } catch (error) {
      console.error("Error in fetching posts:", error);
      throw new Error("Error fetching posts");
    }
  };
  createPost = async (postData: PostFields) => {
    const result = await this.profileDbManager.createPost(postData);
  }
}




export default ProfileManager
