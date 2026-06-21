using MiniBlog.Infrastructure.Persistance;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniBlog.Infrastructure.Repositories
{
    public class TweetRepository : ITweetService
    {
        private readonly ApplicationDbContext _context;

        public TweetRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddTweetAsync(Tweet tweet)
        {
            tweet.CreatedAt = DateTime.UtcNow;
            await _context.Tweets.AddAsync(tweet);
            await _context.SaveChangesAsync();
        }

        public async Task<Tweet> GetTweetByIdAsync(int id)
        {
            return await _context.Tweets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Tweet>> GetAllTweetsAsync()
        {
            return await _context.Tweets
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tweet>> GetTweetsByUserIdAsync(int userId)
        {
            return await _context.Tweets
                .AsNoTracking()
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateTweetAsync(Tweet tweet)
        {
            var trackedTweet = await _context.Tweets.FindAsync(tweet.Id);
            if (trackedTweet == null)
                return false;

            trackedTweet.Content = tweet.Content;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteTweetAsync(int tweetId)
        {
            var tweet = await _context.Tweets.FindAsync(tweetId);
            if (tweet == null)
                return;

            _context.Tweets.Remove(tweet);
            await _context.SaveChangesAsync();
        }
    }
}
