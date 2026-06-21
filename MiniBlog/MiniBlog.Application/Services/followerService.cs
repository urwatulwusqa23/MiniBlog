using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.Core.Entities;
namespace MiniBlog.Application.Services
{
    public class followerService
    {
        private readonly FollowerRepository _followerRepository;

        public followerService(FollowerRepository followerRepository)
        {
            _followerRepository = followerRepository;
        }

        public async Task<IEnumerable<Follower>> GetFollowersAsync(int userId)
        {
            return await _followerRepository.GetFollowers(userId);
        }

        public async Task AddFollowerAsync(Follower follower)
        {
            await _followerRepository.AddFollower(follower);
        }

        public async Task RemoveFollowerAsync(int userId, int followerUserId)
        {
            await _followerRepository.RemoveFollower(userId, followerUserId);
        }
    }
}
