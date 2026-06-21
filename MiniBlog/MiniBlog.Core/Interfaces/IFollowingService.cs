using MiniBlog.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface IFollowingService
    {
        Task<IEnumerable<Following>> GetFollowings(int userId);
        Task<bool> IsFollowing(int followerId, int followedUserId);
    
    }
}
