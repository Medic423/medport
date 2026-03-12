using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("UserPreference")]
public class UserPreference
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public string PreferenceType { get; set; } // NOTIFICATION_EMAIL, NOTIFICATION_SMS, NOTIFICATION_PUSH

    public string Value { get; set; } // JSON

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; }
}
