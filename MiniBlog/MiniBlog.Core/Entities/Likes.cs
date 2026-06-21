using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Entities
{
    public class Like
    {
        public int Id { get; set; }  // Unique identifier for the like

        public int UserId { get; set; }  // ID of the user who liked the tweet
        public User User { get; set; } 

        public int TweetId { get; set; }  // ID of the tweet that is liked
        public Tweet Tweet { get; set; }  

        public DateTime LikedAt { get; set; }
    }
}
