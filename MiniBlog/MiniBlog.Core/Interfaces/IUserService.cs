using MiniBlog.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface IUserService
    {
        Task AddUserAsync(User user);
        Task<User> GetUserByIdAsync(int id);
        Task<User> GetUserByEmailAsync(string email);
        Task UnfollowUserAsync(int currentUserId, int targetUserId);
        Task<bool> FollowUserAsync(int currentUserId, int targetUserId);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int userId);
        Task<bool> IsFollowingAsync(int currentUserId, int targetUserId);
        Task<IEnumerable<User>> GetFollowersAsync(int userId);
        // New methods for following functionality
        Task<IEnumerable<User>> GetFollowingAsync(int userId);
    }
}
