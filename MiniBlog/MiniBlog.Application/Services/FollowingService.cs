using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MiniBlog.Core.Entities;
using MiniBlog.Infrastructure.Repositories;

namespace MiniBlog.Application.Services
{
    public class FollowingService
    {
        private readonly FollowingRepository _followingRepository;

        public FollowingService(FollowingRepository followingRepository)
        {
            _followingRepository = followingRepository;
        }

        // Get all users that the given user is following
        public async Task<IEnumerable<Following>> GetFollowingsAsync(int userId)
        {
            return await _followingRepository.GetFollowings(userId);
        }

        // Check if a user is following another user
        public async Task<bool> IsFollowingAsync(int followerId, int followedUserId)
        {
            return await _followingRepository.IsFollowing(followerId, followedUserId);
        }

        // Add a following relationship
        public async Task<bool> AddFollowingAsync(int userId, int followingUserId)
        {
            return await _followingRepository.AddFollowing(userId, followingUserId);
        }

        // Remove a following relationship
        public async Task<bool> RemoveFollowingAsync(int userId, int followingUserId)
        {
            return await _followingRepository.RemoveFollowing(userId, followingUserId);
        }
    }
}
