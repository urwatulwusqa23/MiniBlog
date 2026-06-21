using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Core.Interfaces;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.Core.Entities;
namespace MiniBlog.Application.Services
{
    public class NotificationService
    {
        private readonly NotificationRepository _notificationRepository;

        public NotificationService(NotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<IEnumerable<Notification>> GetNotificationsAsync(int userId)
        {
            return await _notificationRepository.GetNotifications(userId);
        }

        public async Task AddNotificationAsync(Notification notification)
        {
            await _notificationRepository.AddNotification(notification);
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            await _notificationRepository.MarkAsRead(notificationId);
        }
    }
}
