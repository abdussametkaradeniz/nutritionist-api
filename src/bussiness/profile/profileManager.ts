import { ProfileDbManager } from "../../database/profileDbManager";
import { PostFields } from "../../types/profile";
export class ProfileManager {
  request: PostFields;
  profileDbManager: ProfileDbManager;
  constructor(request: PostFields) {
    this.request = request;
    this.profileDbManager = new ProfileDbManager();
  }
}

export default ProfileManager;
