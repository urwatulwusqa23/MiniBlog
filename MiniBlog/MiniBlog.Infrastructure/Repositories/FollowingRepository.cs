using MiniBlog.Infrastructure.Persistance;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniBlog.Infrastructure.Repositories
{
    public class FollowingRepository : IFollowingService
    {
        private readonly ApplicationDbContext _context;

        public FollowingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Following>> GetFollowings(int userId)
        {
            return await _context.Followings
                .Where(f => f.UserId == userId)
                .Include(f => f.FollowingUser)
                .ToListAsync();
        }

        public async Task<bool> IsFollowing(int followerId, int followedUserId)
        {
            return await _context.Followings
                .AnyAsync(f => f.UserId == followerId &&
                               f.FollowingUserId == followedUserId);
        }

        public async Task<bool> AddFollowing(int userId, int followingUserId)
        {
            if (userId == followingUserId)
                return false;

            var exists = await IsFollowing(userId, followingUserId);
            if (exists)
                return false;

            _context.Followings.Add(new Following
            {
                UserId = userId,
                FollowingUserId = followingUserId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFollowing(int userId, int followingUserId)
        {
            var following = await _context.Followings
                .FirstOrDefaultAsync(f => f.UserId == userId &&
                                          f.FollowingUserId == followingUserId);

            if (following == null)
                return false;

            _context.Followings.Remove(following);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
