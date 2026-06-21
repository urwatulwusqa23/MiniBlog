using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Entities
{
    public class Following
    {
        public int ID { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public int FollowingUserId { get; set; }
        [ForeignKey("FollowingUserId")]
        public User FollowingUser { get; set; }
    }

}
