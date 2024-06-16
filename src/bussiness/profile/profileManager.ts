import { ProfileDbManager } from "../../database/profileDbManager";
import {PostFields} from "../../types/profile"
export class ProfileManager{
request: PostFields;
profileDbManager : ProfileDbManager
constructor(request: PostFields){
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
}

export default ProfileManager
