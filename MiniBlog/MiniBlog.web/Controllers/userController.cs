using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using MiniBlog.web.Helpers;

namespace MiniBlog.web.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService        _userService;
        private readonly ITweetService       _tweetService;
        private readonly IWebHostEnvironment _env;

        public UserController(
            IUserService userService,
            ITweetService tweetService,
            IWebHostEnvironment env)
        {
            _userService  = userService;
            _tweetService = tweetService;
            _env          = env;
        }

        // ── Current user ──────────────────────────────────────────────────────

        // GET /api/users/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var user = await _userService.GetUserByIdAsync(CurrentUserId());
            if (user == null) return NotFound();
            return Ok(MapUser(user));
        }

        // PUT /api/users/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromForm] UpdateProfileRequest req,
                                                  IFormFile? profilePictureFile)
        {
            var user = await _userService.GetUserByIdAsync(CurrentUserId());
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.Username)) user.Username = req.Username.Trim();
            if (!string.IsNullOrWhiteSpace(req.Email))    user.Email    = req.Email.Trim().ToLowerInvariant();
            if (!string.IsNullOrWhiteSpace(req.NewPassword))
                user.Password = PasswordHelper.HashPassword(req.NewPassword);

            if (profilePictureFile?.Length > 0)
                user.ProfilePicture = await SaveProfilePicture(profilePictureFile);

            await _userService.UpdateUserAsync(user);
            return Ok(MapUser(user));
        }

        // GET /api/users/me/followers
        [HttpGet("me/followers")]
        public async Task<IActionResult> GetMyFollowers()
        {
            var followers = await _userService.GetFollowersAsync(CurrentUserId());
            return Ok(followers.Select(MapUser));
        }

        // GET /api/users/me/following
        [HttpGet("me/following")]
        public async Task<IActionResult> GetMyFollowing()
        {
            var following = await _userService.GetFollowingAsync(CurrentUserId());
            return Ok(following.Select(MapUser));
        }

        // ── Other users ───────────────────────────────────────────────────────

        // GET /api/users?q=search
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? q)
        {
            var all = await _userService.GetAllUsersAsync();
            if (!string.IsNullOrWhiteSpace(q))
                all = all.Where(u => u.Username.Contains(q, StringComparison.OrdinalIgnoreCase));
            return Ok(all.Select(MapUser));
        }

        // GET /api/users/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(MapUser(user));
        }

        // GET /api/users/{id}/tweets
        [HttpGet("{id:int}/tweets")]
        public async Task<IActionResult> GetUserTweets(int id)
        {
            var tweets = await _tweetService.GetTweetsByUserIdAsync(id);
            return Ok(tweets.Select(MapTweet));
        }

        // ── Follow ────────────────────────────────────────────────────────────

        // POST /api/users/{id}/follow
        [HttpPost("{id:int}/follow")]
        public async Task<IActionResult> Follow(int id)
        {
            var me = CurrentUserId();
            if (me == id) return BadRequest(new { message = "Cannot follow yourself." });

            var result = await _userService.FollowUserAsync(me, id);
            if (!result) return BadRequest(new { message = "Already following." });
            return Ok(new { success = true });
        }

        // DELETE /api/users/{id}/follow
        [HttpDelete("{id:int}/follow")]
        public async Task<IActionResult> Unfollow(int id)
        {
            await _userService.UnfollowUserAsync(CurrentUserId(), id);
            return Ok(new { success = true });
        }

        // GET /api/users/{id}/is-following
        [HttpGet("{id:int}/is-following")]
        public async Task<IActionResult> IsFollowing(int id)
        {
            var result = await _userService.IsFollowingAsync(CurrentUserId(), id);
            return Ok(new { isFollowing = result });
        }

        // GET /api/users/{id}/followers
        [HttpGet("{id:int}/followers")]
        public async Task<IActionResult> GetFollowers(int id)
        {
            var followers = await _userService.GetFollowersAsync(id);
            return Ok(followers.Select(MapUser));
        }

        // GET /api/users/{id}/following
        [HttpGet("{id:int}/following")]
        public async Task<IActionResult> GetFollowing(int id)
        {
            var following = await _userService.GetFollowingAsync(id);
            return Ok(following.Select(MapUser));
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int CurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        private async Task<string> SaveProfilePicture(IFormFile file)
        {
            var folder = Path.Combine(_env.WebRootPath ?? "wwwroot", "Profiles");
            Directory.CreateDirectory(folder);
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var path     = Path.Combine(folder, fileName);
            await using var fs = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(fs);
            return fileName;
        }

        private static object MapUser(User u) => new
        {
            id             = u.Id,
            username       = u.Username,
            email          = u.Email,
            profilePicture = u.ProfilePicture,
            followersCount = u.FollowersCount,
            followingCount = u.FollowingCount
        };

        private static object MapTweet(Tweet t) => new
        {
            id         = t.Id,
            userId     = t.UserId,
            content    = t.Content,
            likesCount = t.LikesCount,
            createdAt  = t.CreatedAt
        };

        // ── Request DTOs ─────────────────────────────────────────────────────

        public class UpdateProfileRequest
        {
            public string? Username    { get; set; }
            public string? Email       { get; set; }
            public string? NewPassword { get; set; }
        }
    }
}
