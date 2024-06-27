import prisma from "../../prisma/client";
import {PostFields, ProfileFields} from "../types/profile";


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
              postId: post.id
              
            },
          });

          return {
            // ...post,
            // likeCount: likeCount,
            id: post.id,
            userId: post.userId,
            content: post.content,
            imageUrl: post.imageUrl,
            createdAt: post.createdAt,
            updatedAt : post.updatedAt,
            isDeleted: false,
            likeCount: likeCount, 
          };
        })
      );
      return postLikeCounts
  };

  getUserProfile = async (userId: number): Promise<ProfileFields> => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        userName: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const followerCount = await prisma.user.count({
      where: {
        following: {
          some: {
            id: userId,
          },
        },
      },
    });
  
    const followingCount = await prisma.user.count({
      where: {
        followers: {
          some: {
            id: userId,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      bio: user.bio,
      followerCount,
      followingCount,
    }
  };
  getMainPosts = async(userId: number): Promise<PostFields[]> => {
    const following = await prisma.follower.findMany({
      where: {
        followerId:userId,
      },
      select:{
        followingId: true,
      },
    });
        // Takip edilen kullanıcıların userId'lerini bir diziye dönüştürelim
        const followingIds = following.map(f => f.followingId);

        // Eğer kullanıcı kimseyi takip etmiyorsa, boş bir dizi döndürelim
        if (followingIds.length === 0) {
          return [];
        }

        const followingPosts = await prisma.post.findMany({
          where: { 
            userId: {
              in: followingIds,
            },
          },
        });

        if(!followingPosts || followingPosts.length === 0){
          throw new Error("Following post not found");
        }
        const postLikeCounts = await Promise.all(
          followingPosts.map(async (post) => {
            const likeCount = await prisma.postLike.count({
              where: {
                postId: post.id
                
              },
            });
  
            return {
              // ...post,
              // likeCount: likeCount,
              id: post.id,
              userId: post.userId,
              content: post.content,
              postImage: post.imageUrl,
              imageUrl: post.imageUrl,
              createdAt: post.createdAt,
              updatedAt : post.updatedAt,
              isDeleted: false,
              likeCount: likeCount, 
            };
          })
        );
        return postLikeCounts
  };
  createPost = async (postData: PostFields): Promise<any> => {
    try {
      const newPost = await prisma.post.create({
        data: {
          userId: postData.userId,
          content: postData.content,
          imageUrl: postData.imageUrl,
          createdAt: postData.createdAt,
          updatedAt: postData.updatedAt,
          isDeleted:  false,  
        },
      });
  
      return { success: true, message: 'Post created successfully', data: newPost };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, message: 'Failed to create post', error: error };
    }
  };
  
}
