using MiniBlog.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniBlog.Core.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetNotifications(int userId);
        Task AddNotification(Notification notification);
        Task MarkAsRead(int notificationId);
    }
   
}
