using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.Core.Entities;
namespace MiniBlog.Application.Services
{
    public class TweetService
    {
        private readonly TweetRepository _tweetRepository;

        public TweetService(TweetRepository tweetRepository)
        {
            _tweetRepository = tweetRepository;
        }

        public async Task AddTweetAsync(Tweet tweet)
        {
            await _tweetRepository.AddTweetAsync(tweet);
        }

        public async Task<Tweet> GetTweetByIdAsync(int id)
        {
            return await _tweetRepository.GetTweetByIdAsync(id);
        }

        public async Task<IEnumerable<Tweet>> GetAllTweetsAsync()
        {
            return await _tweetRepository.GetAllTweetsAsync();
        }

        public async Task<IEnumerable<Tweet>> GetTweetsByUserIdAsync(int userId)
        {
            return await _tweetRepository.GetTweetsByUserIdAsync(userId);
        }

        public async Task<bool> UpdateTweetAsync(Tweet tweet)
        {
            return await _tweetRepository.UpdateTweetAsync(tweet);
        }


        public async Task DeleteTweetAsync(int tweetId)
        {
            await _tweetRepository.DeleteTweetAsync(tweetId);
        }
    }
}
