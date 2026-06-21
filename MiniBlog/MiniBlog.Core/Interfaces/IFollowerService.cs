using MiniBlog.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface IFollowerService
    {
        Task<IEnumerable<Follower>> GetFollowers(int userId);
        Task AddFollower(Follower follower);
        Task RemoveFollower(int userId, int followerUserId);
    }
}