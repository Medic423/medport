using System.Text.Json.Serialization;

namespace Medport.Domain.Entities
{
    public class NotificationLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        public string NotificationType { get; set; }

        public string Channel { get; set; }

        public string Status { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public DateTime? DeliveredAt { get; set; }

        public string ErrorMessage { get; set; }

        // Navigation
        [JsonIgnore]
        public virtual CenterUser User { get; set; }
    }
}
