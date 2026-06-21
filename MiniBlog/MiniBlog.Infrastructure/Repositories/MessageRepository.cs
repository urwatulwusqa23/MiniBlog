using MiniBlog.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniBlog.Infrastructure.Repositories
{
    public class MessageRepository : IMessageService
    {
        private readonly ApplicationDbContext _context;

        public MessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Message>> GetMessages(int userId, int contactId)
        {
            return await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == contactId) ||
                            (m.SenderId == contactId && m.ReceiverId == userId))
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }

        public async Task SendMessage(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task MarkAsRead(int messageId)
        {
            var message = await _context.Messages.FindAsync(messageId);
            if (message != null)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<int>> GetContactIdsAsync(int userId)
        {
            var sent     = _context.Messages.Where(m => m.SenderId   == userId).Select(m => m.ReceiverId);
            var received = _context.Messages.Where(m => m.ReceiverId == userId).Select(m => m.SenderId);
            return await sent.Union(received).Distinct().ToListAsync();
        }
    }


}
