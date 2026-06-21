using MiniBlog.Infrastructure.Persistance;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniBlog.Infrastructure.Repositories
{
    public class LikeRepository : ILikeService
    {
        private readonly ApplicationDbContext _context;

        public LikeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> LikeTweetAsync(int tweetId, int userId)
        {
            var alreadyLiked = await _context.Likes
                .AnyAsync(l => l.TweetId == tweetId && l.UserId == userId);

            if (alreadyLiked)
                return false;

            _context.Likes.Add(new Like
            {
                TweetId = tweetId,
                UserId  = userId,
                LikedAt = DateTime.UtcNow
            });

            var tweet = await _context.Tweets.FindAsync(tweetId);
            if (tweet != null) tweet.LikesCount++;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlikeTweetAsync(int tweetId, int userId)
        {
            var like = await _context.Likes
                .FirstOrDefaultAsync(l => l.TweetId == tweetId && l.UserId == userId);

            if (like == null)
                return false;

            _context.Likes.Remove(like);

            var tweet = await _context.Tweets.FindAsync(tweetId);
            if (tweet != null) tweet.LikesCount = Math.Max(0, tweet.LikesCount - 1);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetLikesCountAsync(int tweetId)
        {
            return await _context.Likes.CountAsync(l => l.TweetId == tweetId);
        }

        public async Task<bool> IsLikedByUserAsync(int tweetId, int userId)
        {
            return await _context.Likes
                .AnyAsync(l => l.TweetId == tweetId && l.UserId == userId);
        }

        public async Task<IEnumerable<int>> GetLikerIdsAsync(int tweetId)
        {
            return await _context.Likes
                .Where(l => l.TweetId == tweetId)
                .Select(l => l.UserId)
                .ToListAsync();
        }
    }
}
