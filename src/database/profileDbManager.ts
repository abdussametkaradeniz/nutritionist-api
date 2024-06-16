import prisma from "../../prisma/client";
import {PostFields} from "../types/profile";


export class ProfileDbManager {
    getPostsByUserId  =async (userId: number): Promise<PostFields[]> => {
    const posts = await prisma.post.findMany({
      where: {
       userId : userId
      },
    });
    if (!posts || posts.length === 0) {
        throw new Error("Posts not found");
      }
    
      const postLikeCounts = await Promise.all(
        posts.map(async (post) => {
          const likeCount = await prisma.postLike.count({
            where: {
              postId: post.postId
            },
          });

          return {
            ...post,
            // postDate: post.postDate,
            likeCount: likeCount, 
          };
        })
      );
      return postLikeCounts
  };
}
