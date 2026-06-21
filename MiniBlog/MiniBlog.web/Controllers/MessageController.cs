using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;

namespace MiniBlog.web.Controllers
{
    [ApiController]
    [Route("api/messages")]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IUserService    _userService;

        public MessageController(IMessageService messageService, IUserService userService)
        {
            _messageService = messageService;
            _userService    = userService;
        }

        // GET /api/messages?contactId={id}
        [HttpGet]
        public async Task<IActionResult> GetConversation([FromQuery] int contactId)
        {
            var messages = await _messageService.GetMessages(CurrentUserId(), contactId);
            return Ok(messages);
        }

        // GET /api/messages/contacts  → list of users this person has DM'd
        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts()
        {
            var contactIds = await _messageService.GetContactIdsAsync(CurrentUserId());
            var users      = new List<object>();

            foreach (var cid in contactIds)
            {
                var u = await _userService.GetUserByIdAsync(cid);
                if (u != null)
                    users.Add(new
                    {
                        id             = u.Id,
                        username       = u.Username,
                        profilePicture = u.ProfilePicture
                    });
            }

            return Ok(users);
        }

        // POST /api/messages
        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Message content cannot be empty." });

            var message = new Message
            {
                SenderId   = CurrentUserId(),
                ReceiverId = req.ContactId,
                Content    = req.Content.Trim(),
                Timestamp  = DateTime.UtcNow,
                IsRead     = false
            };

            await _messageService.SendMessage(message);
            return Ok(new
            {
                id         = message.Id,
                senderId   = message.SenderId,
                receiverId = message.ReceiverId,
                content    = message.Content,
                timestamp  = message.Timestamp,
                isRead     = message.IsRead
            });
        }

        // PUT /api/messages/{id}/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _messageService.MarkAsRead(id);
            return Ok(new { success = true });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int CurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        // ── Request DTOs ─────────────────────────────────────────────────────

        public class SendMessageRequest
        {
            public int    ContactId { get; set; }
            public string Content   { get; set; } = "";
        }
    }
}
