using MiniBlog.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface ITweetService
    {
        Task AddTweetAsync(Tweet tweet);
        Task<Tweet> GetTweetByIdAsync(int id);
        Task<IEnumerable<Tweet>> GetAllTweetsAsync();
        Task<IEnumerable<Tweet>> GetTweetsByUserIdAsync(int userId);
        Task<bool> UpdateTweetAsync(Tweet tweet);
        Task DeleteTweetAsync(int tweetId);
    

    }
}
