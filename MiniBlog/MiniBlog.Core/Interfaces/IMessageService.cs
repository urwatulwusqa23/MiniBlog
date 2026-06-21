using MiniBlog.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface IMessageService
    {
        Task<IEnumerable<Message>> GetMessages(int userId, int contactId);
        Task SendMessage(Message message);
        Task MarkAsRead(int messageId);
        Task<IEnumerable<int>> GetContactIdsAsync(int userId);
    }
}
