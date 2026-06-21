using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.Core.Entities;

namespace MiniBlog.Application.Services
{
    public class MessageService
    {
        private readonly MessageRepository _messageRepository;

        public MessageService(MessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }

        public async Task<IEnumerable<Message>> GetMessagesAsync(int userId, int contactId)
        {
            return await _messageRepository.GetMessages(userId, contactId);
        }

        public async Task SendMessageAsync(Message message)
        {
            await _messageRepository.SendMessage(message);
        }

        public async Task MarkAsReadAsync(int messageId)
        {
            await _messageRepository.MarkAsRead(messageId);
        }
    }

}
