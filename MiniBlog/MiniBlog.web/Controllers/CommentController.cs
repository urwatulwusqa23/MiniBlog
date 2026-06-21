using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;

namespace MiniBlog.web.Controllers
{
    [ApiController]
    [Route("api/comments")]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly ITweetService   _tweetService;
        private readonly IUserService    _userService;

        public CommentController(
            ICommentService commentService,
            ITweetService   tweetService,
            IUserService    userService)
        {
            _commentService = commentService;
            _tweetService   = tweetService;
            _userService    = userService;
        }

        // GET /api/comments?tweetId={id}
        [HttpGet]
        public async Task<IActionResult> GetComments([FromQuery] int tweetId)
        {
            var comments = await _commentService.GetCommentsByTweetIdAsync(tweetId);
            var result   = new List<object>();

            foreach (var c in comments)
            {
                var user = await _userService.GetUserByIdAsync(c.UserId);
                result.Add(new
                {
                    id          = c.Id,
                    tweetId     = c.TweetId,
                    userId      = c.UserId,
                    content     = c.Content,
                    createdAt   = c.CreatedAt,
                    username    = user?.Username,
                    userAvatar  = user?.ProfilePicture
                });
            }

            return Ok(result);
        }

        // POST /api/comments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCommentRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Comment content cannot be empty." });

            var tweet = await _tweetService.GetTweetByIdAsync(req.TweetId);
            if (tweet == null) return NotFound(new { message = "Tweet not found." });

            var me = CurrentUserId();
            var comment = new Comment
            {
                TweetId   = req.TweetId,
                UserId    = me,
                Content   = req.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _commentService.AddCommentAsync(comment);

            var user = await _userService.GetUserByIdAsync(me);
            return Ok(new
            {
                id         = comment.Id,
                tweetId    = comment.TweetId,
                userId     = comment.UserId,
                content    = comment.Content,
                createdAt  = comment.CreatedAt,
                username   = user?.Username,
                userAvatar = user?.ProfilePicture
            });
        }

        // DELETE /api/comments/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null) return NotFound();
            if (comment.UserId != CurrentUserId()) return Forbid();

            await _commentService.DeleteCommentAsync(id);
            return Ok(new { success = true });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int CurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        // ── Request DTOs ─────────────────────────────────────────────────────

        public class CreateCommentRequest
        {
            public int    TweetId { get; set; }
            public string Content { get; set; } = "";
        }
    }
}
