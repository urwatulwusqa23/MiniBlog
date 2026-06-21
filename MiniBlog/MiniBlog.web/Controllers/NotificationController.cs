using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using MiniBlog.web.Hubs;

namespace MiniBlog.web.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService      _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationController(
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext)
        {
            _notificationService = notificationService;
            _hubContext          = hubContext;
        }

        // GET /api/notifications
        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var notifications = await _notificationService.GetNotifications(CurrentUserId());
            return Ok(notifications);
        }

        // GET /api/notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var all = await _notificationService.GetNotifications(CurrentUserId());
            return Ok(new { count = all.Count(n => !n.IsRead) });
        }

        // POST /api/notifications  → push a notification to a user (called by client after follow/like/comment)
        [HttpPost]
        public async Task<IActionResult> AddNotification([FromBody] CreateNotificationRequest req)
        {
            if (req.UserId == 0 || string.IsNullOrWhiteSpace(req.Message))
                return BadRequest(new { message = "UserId and message are required." });

            var notification = new Notification
            {
                UserId    = req.UserId,
                Message   = req.Message.Trim(),
                Type      = req.Type ?? "General",
                Timestamp = DateTime.UtcNow,
                IsRead    = false
            };

            await _notificationService.AddNotification(notification);

            await _hubContext.Clients
                .Group($"user-{notification.UserId}")
                .SendAsync("ReceiveNotification", new
                {
                    id      = notification.Id,
                    message = notification.Message,
                    type    = notification.Type,
                    time    = notification.Timestamp
                });

            return Ok(new { success = true, id = notification.Id });
        }

        // PUT /api/notifications/{id}/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _notificationService.MarkAsRead(id);
            return Ok(new { success = true });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int CurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        // ── Request DTOs ─────────────────────────────────────────────────────

        public class CreateNotificationRequest
        {
            public int    UserId  { get; set; }
            public string Message { get; set; } = "";
            public string? Type   { get; set; }
        }
    }
}
