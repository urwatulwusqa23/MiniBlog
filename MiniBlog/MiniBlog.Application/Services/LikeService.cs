using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.Core.Entities;
namespace MiniBlog.Application.Services
{
    public class LikeService 
    {
        private readonly LikeRepository _likeRepository;

        // Inject the repository into the service
        public LikeService(LikeRepository likeRepository)
        {
            _likeRepository = likeRepository;
        }

        // Like a tweet if the user hasn't already liked it
        public async Task LikeTweetAsync(int tweetId, int userId)
        {
            await _likeRepository.LikeTweetAsync(tweetId, userId);
        }

        // Unlike a tweet if the user has already liked it
        public async Task UnlikeTweetAsync(int tweetId, int userId)
        {
            await _likeRepository.UnlikeTweetAsync(tweetId, userId);
        }

        // Get the number of likes for a specific tweet
        public async Task<int> GetLikesCountAsync(int tweetId)
        {
            return await _likeRepository.GetLikesCountAsync(tweetId);
        }

        // Check if a user has liked a specific tweet
        public async Task<bool> IsLikedByUserAsync(int tweetId, int userId)
        {
            return await _likeRepository.IsLikedByUserAsync(tweetId, userId);
        }
    }
}
