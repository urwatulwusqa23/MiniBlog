using MiniBlog.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace MiniBlog.Infrastructure.Repositories
{
    public class FollowerRepository : IFollowerService
    {
        private readonly ApplicationDbContext _context;

        public FollowerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Follower>> GetFollowers(int userId)
        {
            return await _context.Followers
                .Where(f => f.UserId == userId)
                .Include(f => f.FollowerUser) // Load related user details if needed
                .ToListAsync();
        }

        public async Task AddFollower(Follower follower)
        {
            _context.Followers.Add(follower);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveFollower(int userId, int followerUserId)
        {
            var follower = await _context.Followers
                .FirstOrDefaultAsync(f => f.UserId == userId && f.FollowerUserId == followerUserId);

            if (follower != null)
            {
                _context.Followers.Remove(follower);
                await _context.SaveChangesAsync();
            }
        }
    }
}
