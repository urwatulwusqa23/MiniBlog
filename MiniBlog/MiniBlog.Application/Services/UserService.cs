using MiniBlog.Core.Entities;
using MiniBlog.Infrastructure.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MiniBlog.Application.Services
{
    public class UserService
    {
        private readonly UserRepository _userRepository;

        public UserService(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // ------------------ USER CRUD ------------------
        public async Task AddUserAsync(User user)
        {
            await _userRepository.AddUserAsync(user);
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetUserByIdAsync(id);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllUsersAsync();
        }

        public async Task UpdateUserAsync(User user)
        {
            await _userRepository.UpdateUserAsync(user);
        }

        public async Task DeleteUserAsync(int userId)
        {
            await _userRepository.DeleteUserAsync(userId);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _userRepository.GetUserByUsernameAsync(username);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetUserByEmailAsync(email);
        }

        // ------------------ FOLLOW / UNFOLLOW ------------------
        public async Task<bool> FollowUserAsync(int currentUserId, int targetUserId)
        {
            return await _userRepository.FollowUserAsync(currentUserId, targetUserId);
        }

        public async Task UnfollowUserAsync(int currentUserId, int targetUserId)
        {
            await _userRepository.UnfollowUserAsync(currentUserId, targetUserId);
        }

        public async Task<bool> IsFollowingAsync(int currentUserId, int targetUserId)
        {
            return await _userRepository.IsFollowingAsync(currentUserId, targetUserId);
        }

        public async Task<IEnumerable<User>> GetFollowingAsync(int userId)
        {
            return await _userRepository.GetFollowingAsync(userId);
        }

        public async Task<IEnumerable<User>> GetFollowersAsync(int userId)
        {
            return await _userRepository.GetFollowersAsync(userId);
        }

        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _userRepository.GetFollowersCountAsync(userId);
        }

        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _userRepository.GetFollowingCountAsync(userId);
        }
    }
}
