using MiniBlog.Infrastructure.Persistance;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniBlog.Infrastructure.Repositories
{
    public class UserRepository : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ------------------ USER CRUD ------------------
        public async Task AddUserAsync(User user)
        {
            if (string.IsNullOrEmpty(user.ProfilePicture))
                user.ProfilePicture = "/Images/download.jpeg";

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
            => await _context.Users.FindAsync(id);

        public async Task<IEnumerable<User>> GetAllUsersAsync()
            => await _context.Users.ToListAsync();

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User> GetUserByUsernameAsync(string username)
            => await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        public async Task<User> GetUserByEmailAsync(string email)
            => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // ------------------ FOLLOW LOGIC ------------------
        public async Task<bool> FollowUserAsync(int currentUserId, int targetUserId)
        {
            if (currentUserId == targetUserId)
                return false;

            var alreadyFollowing = await _context.Followings
                .AnyAsync(f => f.UserId == currentUserId && f.FollowingUserId == targetUserId);

            if (alreadyFollowing)
                return false;

            _context.Followings.Add(new Following
            {
                UserId = currentUserId,
                FollowingUserId = targetUserId
            });

            // Update counts
            var currentUser = await _context.Users.FindAsync(currentUserId);
            var targetUser = await _context.Users.FindAsync(targetUserId);

            if (currentUser != null) currentUser.FollowingCount++;
            if (targetUser != null) targetUser.FollowersCount++;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UnfollowUserAsync(int currentUserId, int targetUserId)
        {
            var follow = await _context.Followings
                .FirstOrDefaultAsync(f => f.UserId == currentUserId && f.FollowingUserId == targetUserId);

            if (follow == null) return;

            _context.Followings.Remove(follow);

            // Update counts
            var currentUser = await _context.Users.FindAsync(currentUserId);
            var targetUser = await _context.Users.FindAsync(targetUserId);

            if (currentUser != null) currentUser.FollowingCount = Math.Max(0, currentUser.FollowingCount - 1);
            if (targetUser != null) targetUser.FollowersCount = Math.Max(0, targetUser.FollowersCount - 1);

            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsFollowingAsync(int currentUserId, int targetUserId)
            => await _context.Followings
                .AnyAsync(f => f.UserId == currentUserId && f.FollowingUserId == targetUserId);

        public async Task<IEnumerable<User>> GetFollowingAsync(int userId)
            => await _context.Followings
                .Where(f => f.UserId == userId)
                .Select(f => f.FollowingUser)
                .ToListAsync();

        public async Task<IEnumerable<User>> GetFollowersAsync(int userId)
            => await _context.Followings
                .Where(f => f.FollowingUserId == userId)
                .Select(f => f.User)
                .ToListAsync();

        public async Task<int> GetFollowersCountAsync(int userId)
            => await _context.Followings.CountAsync(f => f.FollowingUserId == userId);

        public async Task<int> GetFollowingCountAsync(int userId)
            => await _context.Followings.CountAsync(f => f.UserId == userId);
    }
}
