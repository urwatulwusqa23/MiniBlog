using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface ILikeService
    {
        Task<int> GetLikesCountAsync(int tweetId);
        Task<bool> IsLikedByUserAsync(int tweetId, int userId);
        Task<bool> UnlikeTweetAsync(int tweetId, int userId);
        Task<bool> LikeTweetAsync(int tweetId, int userId);
        Task<IEnumerable<int>> GetLikerIdsAsync(int tweetId);
    }
}
