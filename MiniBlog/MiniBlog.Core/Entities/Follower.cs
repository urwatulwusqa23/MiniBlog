using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Entities
{
    
    public class Follower
    {
        public int ID { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public int FollowerUserId { get; set; }
        [ForeignKey("FollowerUserId")]
        public User FollowerUser { get; set; }
    }
}
