using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;

namespace MiniBlog.web.Controllers
{
    [ApiController]
    [Route("api/tweets")]
    [Authorize]
    public class TweetController : ControllerBase
    {
        private readonly ITweetService _tweetService;
        private readonly IUserService  _userService;
        private readonly ILikeService  _likeService;

        public TweetController(
            ITweetService tweetService,
            IUserService  userService,
            ILikeService  likeService)
        {
            _tweetService = tweetService;
            _userService  = userService;
            _likeService  = likeService;
        }

        // GET /api/tweets  → feed with author info + isLiked flag
        [HttpGet]
        public async Task<IActionResult> GetFeed()
        {
            var me     = CurrentUserId();
            var tweets = await _tweetService.GetAllTweetsAsync();
            var result = new List<object>();

            foreach (var t in tweets)
            {
                var author      = await _userService.GetUserByIdAsync(t.UserId);
                var isFollowing = await _userService.IsFollowingAsync(me, t.UserId);
                var isLiked     = await _likeService.IsLikedByUserAsync(t.Id, me);

                result.Add(new
                {
                    tweet       = MapTweet(t),
                    user        = author == null ? null : MapUser(author),
                    isFollowing,
                    isLiked
                });
            }

            return Ok(result);
        }

        // GET /api/tweets/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tweet = await _tweetService.GetTweetByIdAsync(id);
            if (tweet == null) return NotFound();

            var me      = CurrentUserId();
            var author  = await _userService.GetUserByIdAsync(tweet.UserId);
            var isLiked = await _likeService.IsLikedByUserAsync(id, me);

            return Ok(new
            {
                tweet   = MapTweet(tweet),
                user    = author == null ? null : MapUser(author),
                isLiked
            });
        }

        // POST /api/tweets
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTweetRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Content cannot be empty." });

            var tweet = new Tweet
            {
                UserId    = CurrentUserId(),
                Content   = req.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _tweetService.AddTweetAsync(tweet);
            return Ok(MapTweet(tweet));
        }

        // PUT /api/tweets/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Edit(int id, [FromBody] CreateTweetRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Content cannot be empty." });

            var tweet = await _tweetService.GetTweetByIdAsync(id);
            if (tweet == null) return NotFound();
            if (tweet.UserId != CurrentUserId()) return Forbid();

            tweet.Content = req.Content.Trim();
            var ok = await _tweetService.UpdateTweetAsync(tweet);
            if (!ok) return BadRequest(new { message = "Update failed." });

            return Ok(MapTweet(tweet));
        }

        // DELETE /api/tweets/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tweet = await _tweetService.GetTweetByIdAsync(id);
            if (tweet == null) return NotFound();
            if (tweet.UserId != CurrentUserId()) return Forbid();

            await _tweetService.DeleteTweetAsync(id);
            return Ok(new { success = true });
        }

        // POST /api/tweets/{id}/like  → toggles like
        [HttpPost("{id:int}/like")]
        public async Task<IActionResult> ToggleLike(int id)
        {
            var me    = CurrentUserId();
            var tweet = await _tweetService.GetTweetByIdAsync(id);
            if (tweet == null) return NotFound(new { message = "Tweet not found." });

            bool isNowLiked;
            if (await _likeService.IsLikedByUserAsync(id, me))
            {
                await _likeService.UnlikeTweetAsync(id, me);
                isNowLiked = false;
            }
            else
            {
                await _likeService.LikeTweetAsync(id, me);
                isNowLiked = true;
            }

            var count = await _likeService.GetLikesCountAsync(id);
            return Ok(new { success = true, isLiked = isNowLiked, likesCount = count });
        }

        // GET /api/tweets/{id}/likers
        [HttpGet("{id:int}/likers")]
        public async Task<IActionResult> GetLikers(int id)
        {
            var userIds = await _likeService.GetLikerIdsAsync(id);
            var result  = new List<object>();
            foreach (var uid in userIds)
            {
                var u = await _userService.GetUserByIdAsync(uid);
                if (u != null) result.Add(MapUser(u));
            }
            return Ok(result);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int CurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        private static object MapTweet(Tweet t) => new
        {
            id         = t.Id,
            userId     = t.UserId,
            content    = t.Content,
            likesCount = t.LikesCount,
            createdAt  = t.CreatedAt
        };

        private static object MapUser(Core.Entities.User u) => new
        {
            id             = u.Id,
            username       = u.Username,
            profilePicture = u.ProfilePicture,
            followersCount = u.FollowersCount,
            followingCount = u.FollowingCount
        };

        // ── Request DTOs ─────────────────────────────────────────────────────

        public class CreateTweetRequest
        {
            public string Content { get; set; } = "";
        }
    }
}
